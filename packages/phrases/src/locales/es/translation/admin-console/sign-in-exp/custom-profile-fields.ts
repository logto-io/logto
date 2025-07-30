const custom_profile_fields = {
  table: {
    add_button: 'Agregar campo de perfil',
    title: {
      field_label: 'Etiqueta del campo',
      type: 'Tipo',
      user_data_key: 'Clave en el perfil del usuario',
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
    built_in_properties: 'Propiedades integradas del perfil del usuario',
    custom_properties: 'Propiedades personalizadas',
    custom_data_field_name: 'Nombre del campo de datos personalizado',
    custom_data_field_input_placeholder:
      'Ingresa el nombre del campo de datos personalizado, ej. `miCampoFavorito`',
    custom_field: {
      title: 'Campo de datos personalizado',
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
    key: 'Clave de datos del usuario',
    field_name: 'Nombre del campo',
    field_type: 'Tipo de campo',
    settings: 'Configuraciones',
    settings_description:
      'Personaliza campos para recopilar más información del perfil del usuario durante el registro.',
    address_format: 'Formato de dirección',
    single_line_address: 'Dirección en una línea',
    multi_line_address:
      'Dirección en múltiples líneas (Ej., Calle, Ciudad, Estado, Código Postal, País)',
    composition_parts: 'Partes de composición',
    composition_parts_tip: 'Selecciona las partes para componer el campo complejo.',
    label: 'Etiqueta de visualización',
    label_placeholder: 'Etiqueta',
    label_tip:
      '¿Necesitas localización? Agrega idiomas en <a>Experiencia de inicio de sesión > Contenido</a>',
    placeholder: 'Marcador de posición de visualización',
    placeholder_placeholder: 'Marcador de posición',
    description: 'Descripción de visualización',
    description_placeholder: 'Descripción',
    options: 'Opciones',
    options_tip:
      'Ingresa cada opción en una nueva línea. Usa punto y coma para separar clave y valor, ej. `clave:valor`',
    options_placeholder: 'valor1:etiqueta1\nvalor2:etiqueta2\nvalor3:etiqueta3',
    regex: 'Expresión regular',
    regex_tip: 'Define una expresión regular para validar la entrada.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Formato de fecha',
    date_format_us: 'Estados Unidos (MM/dd/aaaa)',
    date_format_uk: 'Reino Unido y Europa (dd/MM/aaaa)',
    date_format_iso: 'Estándar internacional (aaaa-MM-dd)',
    custom_date_format: 'Formato de fecha personalizado',
    custom_date_format_placeholder: 'Ingresa el formato de fecha personalizado. Ej. "MM-dd-aaaa"',
    custom_date_format_tip:
      'Consulta la documentación de <a>date-fns</a> para tokens de formato válidos.',
    input_length: 'Longitud de entrada',
    value_range: 'Rango de valores',
    min: 'Mínimo',
    max: 'Máximo',
    required: 'Obligatorio',
    required_description:
      'Cuando está habilitado, este campo debe ser completado por los usuarios. Cuando está deshabilitado, este campo es opcional.',
  },
};

export default Object.freeze(custom_profile_fields);
