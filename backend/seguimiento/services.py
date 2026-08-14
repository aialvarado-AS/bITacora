"""Servicios compartidos por los modulos de seguimiento."""

from django.contrib.contenttypes.models import ContentType


def registrar_actividad(
    item,
    tipo,
    autor=None,
    campo='',
    valor_anterior='',
    valor_nuevo='',
    descripcion='',
):
    """Crea un bitacora.models.RegistroActividad ligado a `item` (cualquier
    instancia de un modulo que herede de ItemSeguimiento) via su content
    type generico.

    `tipo` debe ser uno de los valores de bitacora.models.RegistroActividad.Tipo.
    El campo `modulo` del registro se completa con item._meta.model_name.

    Import perezoso de bitacora.models dentro de la funcion para evitar
    import circular entre las apps seguimiento y bitacora.
    """
    from bitacora.models import RegistroActividad

    RegistroActividad.objects.create(
        content_type=ContentType.objects.get_for_model(item),
        object_id=item.pk,
        modulo=item._meta.model_name,
        tipo=tipo,
        autor=autor,
        descripcion=descripcion,
        campo=campo,
        valor_anterior='' if valor_anterior is None else str(valor_anterior),
        valor_nuevo='' if valor_nuevo is None else str(valor_nuevo),
    )
