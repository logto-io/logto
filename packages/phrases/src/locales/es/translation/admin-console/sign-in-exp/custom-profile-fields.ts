const custom_profile_fields = {
  table: {
    add_button: 'Agregar campo de perfil',
    title: {
      field_label: 'Etiqueta del campo',
      type: 'Tipo',
      user_data_key: 'Clave de datos de usuario',
    },
    placeholder: {
      title: 'Recopilar perfil del usuario',
      description:
        'Personaliza campos para recopilar más información del perfil del usuario durante el registro.',
    },
  },
  type: {
    Text: 'Texto',
    Number: 'Número',
    Date: 'Fecha',
    Checkbox: 'Casilla de verificación (Booleano)',
    Select: 'Desplegable (Selección única)',
    Url: 'URL',
    Regex: 'Expresión regular',
    Address: 'Dirección (Composición)',
    Fullname: 'Nombre completo (Composición)',
  },
  modal: {
    title: 'Agregar campo de perfil',
    subtitle:
      'Personaliza campos para recopilar más información del perfil del usuario durante el registro.',
    built_in_properties: 'Datos básicos del usuario',
    custom_properties: 'Datos personalizados del usuario',
    custom_data_field_name: 'Clave de datos de usuario',
    custom_data_field_input_placeholder:
      'Ingresa la clave de datos de usuario, ej. `myFavoriteFieldName`',
    custom_field: {
      title: 'Datos personalizados',
      description:
        'Cualquier propiedad adicional del usuario que puedas definir para cumplir con los requisitos únicos de tu aplicación.',
    },
    type_required: 'Por favor selecciona un tipo de propiedad',
    create_button: 'Crear campo de perfil',
  },
  details: {
    page_title: 'Detalles del campo de perfil',
    back_to_sie: 'Volver a la experiencia de inicio de sesión',
    enter_field_name: 'Ingresa el nombre del campo de perfil',
    delete_description:
      'Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este campo de perfil?',
    field_deleted: 'El campo de perfil {{name}} ha sido eliminado exitosamente.',
    key: 'Clave de datos de usuario',
    field_name: 'Nombre del campo',
    field_type: 'Tipo de campo',
    settings: 'Configuraciones',
    settings_description:
      'Personaliza campos para recopilar más información del perfil del usuario durante el registro.',
    address_format: 'Formato de dirección',
    single_line_address: 'Dirección en una línea',
    multi_line_address:
      'Dirección en múltiples líneas (Ej., Calle, Ciudad, Estado, Código Postal, País)',
    components: 'Componentes',
    components_tip: 'Selecciona los componentes para componer el campo complejo.',
    label: 'Etiqueta del campo',
    label_placeholder: 'Etiqueta',
    label_tip:
      '¿Necesitas localización? Agrega idiomas en <a>Experiencia de inicio de sesión > Contenido</a>',
    label_tooltip:
      'Etiqueta flotante que identifica el propósito del campo. Aparece dentro del input y se desplaza arriba cuando tiene foco o valor.',
    placeholder: 'Marcador de posición del campo',
    placeholder_placeholder: 'Marcador de posición',
    placeholder_tooltip:
      'Ejemplo inline o pista de formato dentro del campo. Generalmente aparece tras flotar la etiqueta y debe ser breve (ej.: MM/DD/YYYY).',
    description: 'Descripción del campo',
    description_placeholder: 'Descripción',
    description_tooltip:
      'Texto de apoyo mostrado debajo del campo. Úsalo para instrucciones más extensas o notas de accesibilidad.',
    options: 'Opciones',
    options_tip:
      'Ingresa cada opción en una nueva línea. Formato: value:label (ej. red:Red). Puedes ingresar solo value; si no se proporciona label, se mostrará el mismo value como etiqueta.',
    options_placeholder: 'valor1:etiqueta1\nvalor2:etiqueta2\nvalor3:etiqueta3',
    regex: 'Expresión regular',
    regex_tip: 'Define una expresión regular para validar la entrada.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Formato de fecha',
    date_format_us: 'MM/dd/yyyy (ej. Estados Unidos)',
    date_format_uk: 'dd/MM/yyyy (ej. Reino Unido y Europa)',
    date_format_iso: 'yyyy-MM-dd (Estándar internacional)',
    custom_date_format: 'Formato de fecha personalizado',
    custom_date_format_placeholder: 'Ingresa el formato de fecha personalizado. Ej. "MM-dd-yyyy"',
    custom_date_format_tip:
      'Consulta la documentación de <a>date-fns</a> para tokens de formato válidos.',
    input_length: 'Longitud de entrada',
    value_range: 'Rango de valores',
    min: 'Mínimo',
    max: 'Máximo',
    default_value: 'Valor por defecto',
    checkbox_checked: 'Marcado (True)',
    checkbox_unchecked: 'Desmarcado (False)',
    required: 'Obligatorio',
    required_description:
      'Cuando está habilitado, este campo debe ser completado por los usuarios. Cuando está deshabilitado, este campo es opcional.',
  },
};

export default Object.freeze(custom_profile_fields);
