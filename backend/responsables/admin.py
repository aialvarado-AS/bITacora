from django import forms
from django.contrib import admin

from .models import Responsable


class ResponsableAdminForm(forms.ModelForm):
    """Hace que 'correo' sea opcional en el formulario del admin: si se
    deja vacio y se selecciono un usuario, se autocompleta con el email de
    ese usuario. Si no hay usuario ni correo, se exige llenar uno de los
    dos."""

    class Meta:
        model = Responsable
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['correo'].required = False

    def clean(self):
        cleaned_data = super().clean()
        correo = cleaned_data.get('correo')
        usuario = cleaned_data.get('usuario')

        if not correo and usuario is not None:
            correo = usuario.email

        if not correo:
            raise forms.ValidationError(
                'Debes ingresar un correo, o seleccionar un usuario que '
                'tenga uno (el correo se toma automaticamente de ahi).'
            )

        cleaned_data['correo'] = correo
        return cleaned_data


@admin.register(Responsable)
class ResponsableAdmin(admin.ModelAdmin):
    form = ResponsableAdminForm
    list_display = ('nombre', 'correo', 'area', 'activo', 'usuario')
    list_filter = ('activo', 'area')
    search_fields = ('nombre', 'correo')
