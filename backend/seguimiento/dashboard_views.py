"""Vistas del dashboard de KPIs.

Cruzan datos de los 4 modulos de seguimiento (Compras, Proyectos,
Requerimientos internos, Mantenimientos) para que el frontend no tenga que
golpear los 4 endpoints por separado y cruzar los datos a mano.

Vive en la app seguimiento (no se crea una app nueva) porque los 4 modulos
ya dependen de ella para su modelo base ItemSeguimiento.
"""

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from compras.models import Compra
from compras.serializers import CompraSerializer
from mantenimientos.models import Mantenimiento
from mantenimientos.serializers import MantenimientoSerializer
from proyectos.models import Proyecto
from proyectos.serializers import ProyectoSerializer
from requerimientos.models import RequerimientoInterno
from requerimientos.serializers import RequerimientoInternoSerializer
from responsables.models import Responsable

from .choices import EstadoItem

# Clave de modulo -> (modelo, serializer). La clave coincide con
# ModuleConfig.key / apiBasePath del frontend ('compras' -> /api/compras/,
# 'proyectos' -> /api/proyectos/, etc.) para que sea trivial de mapear a una
# ruta o a un ModuleConfig desde el lado del cliente.
MODULOS = (
    ('compras', Compra, CompraSerializer),
    ('proyectos', Proyecto, ProyectoSerializer),
    ('requerimientos', RequerimientoInterno, RequerimientoInternoSerializer),
    ('mantenimientos', Mantenimiento, MantenimientoSerializer),
)

# Estados que se consideran "terminales": un item en uno de estos estados ya
# no cuenta como pendiente para una persona (se excluye de Mis Pendientes).
ESTADOS_FINALES = (EstadoItem.COMPLETADO, EstadoItem.CANCELADO)


class DashboardResumenView(APIView):
    """GET /api/dashboard/resumen/

    KPIs agregados cruzando los 4 modulos de seguimiento. No recibe query
    params: siempre calcula sobre el total de items existentes.

    Respuesta:
    {
      "por_modulo": [
        {
          "modulo": "compras",
          "total": 42,
          "pendientes": 10,
          "en_proceso": 15,
          "completados": 12,
          "atrasados": 5
        },
        ... (uno por cada uno de los 4 modulos, mismo orden que MODULOS)
      ],
      "por_semaforo": {"verde": 30, "amarillo": 8, "rojo": 12, "gris": 25},
      "por_responsable": [
        {
          "responsable_id": 3,
          "responsable_nombre": "Juan Perez",
          "total_asignados": 7,
          "atrasados": 2
        },
        ... (solo responsables con al menos 1 item asignado, ordenados por
        total_asignados descendente y luego por nombre)
      ]
    }
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        por_modulo = []
        semaforo_totales = {'verde': 0, 'amarillo': 0, 'rojo': 0, 'gris': 0}
        responsables_acumulado = {}

        for modulo_key, model, _serializer in MODULOS:
            queryset = model.objects.select_related('responsable_actual').all()

            total = 0
            pendientes = 0
            en_proceso = 0
            completados = 0
            atrasados = 0

            # Volumen bajo (herramienta interna): es aceptable iterar en
            # Python en vez de resolver estos conteos con anotaciones SQL,
            # ya que 'semaforo' es una property de Python, no algo que viva
            # en la base de datos.
            for item in queryset:
                total += 1
                if item.estado == EstadoItem.PENDIENTE:
                    pendientes += 1
                elif item.estado == EstadoItem.EN_PROCESO:
                    en_proceso += 1
                elif item.estado == EstadoItem.COMPLETADO:
                    completados += 1

                color = item.semaforo
                semaforo_totales[color] += 1
                if color == 'rojo':
                    atrasados += 1

                responsable = item.responsable_actual
                if responsable is not None:
                    acumulado = responsables_acumulado.setdefault(
                        responsable.id,
                        {
                            'responsable_id': responsable.id,
                            'responsable_nombre': responsable.nombre,
                            'total_asignados': 0,
                            'atrasados': 0,
                        },
                    )
                    acumulado['total_asignados'] += 1
                    if color == 'rojo':
                        acumulado['atrasados'] += 1

            por_modulo.append({
                'modulo': modulo_key,
                'total': total,
                'pendientes': pendientes,
                'en_proceso': en_proceso,
                'completados': completados,
                'atrasados': atrasados,
            })

        por_responsable = sorted(
            responsables_acumulado.values(),
            key=lambda entry: (-entry['total_asignados'], entry['responsable_nombre']),
        )

        return Response({
            'por_modulo': por_modulo,
            'por_semaforo': semaforo_totales,
            'por_responsable': por_responsable,
        })


class MisPendientesView(APIView):
    """GET /api/dashboard/mis-pendientes/

    Si el usuario autenticado tiene un responsables.Responsable asociado
    (via Responsable.usuario), devuelve la lista aplanada de items (de los
    4 modulos, cada uno serializado con el serializer completo de su propio
    modulo, agregandole la clave 'modulo') asignados a ese responsable cuyo
    estado no sea COMPLETADO ni CANCELADO, ordenados por fecha_plazo_maximo
    ascendente (los mas urgentes primero).

    Si el usuario no tiene Responsable asociado, devuelve [].

    Respuesta: lista plana, por ejemplo:
    [
      {
        "id": 8,
        "modulo": "compras",
        "titulo": "...",
        "descripcion": "...",
        "estado": "EN_PROCESO",
        "prioridad": "ALTA",
        "responsable_actual": 3,
        "responsable_actual_detail": {"id": 3, "nombre": "...", "correo": "...", "area": "..."},
        "fecha_inicio": "2026-08-01",
        "fecha_plazo_maximo": "2026-08-15",
        "fecha_completado": null,
        "semaforo": "amarillo",
        "creado_por": {"id": 1, "username": "...", "first_name": "...", "last_name": "...", "rol": "ADMIN"},
        "creado_en": "2026-08-01T12:00:00Z",
        "actualizado_en": "2026-08-10T09:00:00Z",
        "numero_oc": "...", "proveedor": "...", "monto_estimado": "...", "moneda": "CLP", "centro_costo": "..."
        // (los campos propios del modulo varian: los de arriba son los de Compra)
      },
      ...
    ]
    No es paginada (se espera una lista corta: los pendientes de una sola
    persona).
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        responsable = Responsable.objects.filter(usuario=request.user).first()
        if responsable is None:
            return Response([])

        pendientes = []
        for modulo_key, model, serializer_class in MODULOS:
            queryset = (
                model.objects.select_related('responsable_actual', 'creado_por')
                .filter(responsable_actual=responsable)
                .exclude(estado__in=ESTADOS_FINALES)
            )
            for item in queryset:
                pendientes.append((item.fecha_plazo_maximo, modulo_key, item, serializer_class))

        pendientes.sort(key=lambda entry: entry[0])

        resultado = []
        for _fecha, modulo_key, item, serializer_class in pendientes:
            data = dict(serializer_class(item).data)
            data['modulo'] = modulo_key
            resultado.append(data)

        return Response(resultado)
