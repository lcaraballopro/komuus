const messages = {
  es: {
    translations: {
      signup: {
        title: "Registro",
        toasts: {
          success:
            "¡El usuario ha sido creado satisfactoriamente! ¡Ahora inicia sesión!",
          fail: "Error creando el usuario. Verifica la data reportada.",
        },
        form: {
          name: "Nombre",
          email: "Correo Electrónico",
          password: "Contraseña",
        },
        buttons: {
          submit: "Regístrate",
          login: "¿Ya tienes una cuenta? ¡Inicia sesión!",
        },
      },
      login: {
        title: "Inicio de Sesión",
        form: {
          email: "Correo Electrónico",
          password: "Contraseña",
        },
        buttons: {
          submit: "Ingresa",
          register: "¿No tienes cuenta? ¡Regístrate!",
        },
      },
      auth: {
        toasts: {
          success: "¡Inicio de sesión exitoso!",
        },
      },
      dashboard: {
        periods: {
          today: "Hoy",
          week: "Últimos 7 días",
          month: "Últimos 30 días",
        },
        kpis: {
          totalTickets: "Tickets Período",
          resolutionRate: "Tasa Resolución",
          pending: "Pendientes",
          newContacts: "Nuevos Contactos",
        },
        sections: {
          realtime: "Estado Actual",
        },
        charts: {
          perDay: {
            title: "Conversaciones hoy: ",
          },
          trend: "Tendencia del Período",
          queueDistribution: "Por Cola",
          agentPerformance: "Top Agentes",
        },
        messages: {
          inAttendance: {
            title: "En servicio"
          },
          waiting: {
            title: "Esperando"
          },
          closed: {
            title: "Finalizado"
          },
          withBot: "Con Bot",
          closedToday: "Cerrados hoy",
        }
      },
      reports: {
        title: "Reportes",
        refresh: "Actualizar",
        filters: {
          startDate: "Fecha inicio",
          endDate: "Fecha fin",
          agent: "Agente",
          queue: "Cola",
          status: "Estado",
        },
        stats: {
          total: "Total Tickets",
          open: "Abiertos",
          pending: "Pendientes",
          closed: "Cerrados",
          bot: "Bot",
          totalContacts: "Total Contactos",
          newContacts: "Nuevos en el Período",
        },
        charts: {
          daily: "Tickets por Día",
          distribution: "Distribución por Estado",
          agentPerformance: "Rendimiento por Agente",
        },
        tables: {
          queues: "Estadísticas por Cola",
          agents: "Detalle por Agente",
          conversations: "Historial de Conversaciones",
        },
        export: {
          excel: "Exportar Excel",
          pdf: "Exportar PDF",
        },
      },
      connections: {
        title: "Cuentas",
        toasts: {
          deleted:
            "¡La conexión de WhatsApp ha sido borrada satisfactoriamente!",
        },
        confirmationModal: {
          deleteTitle: "Borrar",
          deleteMessage: "¿Estás seguro? Este proceso no puede ser revertido.",
          disconnectTitle: "Desconectar",
          disconnectMessage: "Estás seguro? Deberá volver a leer el código QR",
        },
        buttons: {
          add: "Agrega WhatsApp",
          disconnect: "Desconectar",
          tryAgain: "Inténtalo de nuevo",
          qrcode: "QR CODE",
          newQr: "Nuevo QR CODE",
          connecting: "Conectando",
          config: "Configurar",
        },
        toolTips: {
          disconnected: {
            title: "No se pudo iniciar la sesión de WhatsApp",
            content:
              "Asegúrese de que su teléfono celular esté conectado a Internet y vuelva a intentarlo o solicite un nuevo código QR",
          },
          qrcode: {
            title: "Esperando la lectura del código QR",
            content:
              "Haga clic en el botón 'CÓDIGO QR' y lea el Código QR con su teléfono celular para iniciar la sesión",
          },
          connected: {
            title: "Conexión establecida",
          },
          timeout: {
            title: "Se perdió la conexión con el teléfono celular",
            content:
              "Asegúrese de que su teléfono celular esté conectado a Internet y que WhatsApp esté abierto, o haga clic en el botón 'Desconectar' para obtener un nuevo código QR",
          },
        },
        table: {
          name: "Nombre",
          status: "Estado",
          lastUpdate: "Última Actualización",
          default: "Por Defecto",
          actions: "Acciones",
          session: "Sesión",
        },
      },
      whatsappModal: {
        title: {
          add: "Agrega WhatsApp",
          edit: "Edita WhatsApp",
        },
        form: {
          name: "Nombre",
          default: "Por Defecto",
          aiAgent: "Agente IA",
          noAgent: "Sin agente IA",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "WhatsApp guardado satisfactoriamente.",
      },
      qrCode: {
        message: "Lée el código QR para empezar la sesión.",
      },
      contacts: {
        title: "Contactos",
        toasts: {
          deleted: "¡Contacto borrado satisfactoriamente!",
        },
        searchPlaceholder: "Buscar...",
        confirmationModal: {
          deleteTitle: "Borrar",
          importTitlte: "Importar contactos",
          deleteMessage:
            "¿Estás seguro que deseas borrar este contacto? Todos los tickets relacionados se perderán.",
          importMessage:
            "¿Quieres importar todos los contactos desde tu teléfono?",
        },
        buttons: {
          import: "Importar Contactos",
          add: "Agregar Contacto",
        },
        table: {
          name: "Nombre",
          whatsapp: "WhatsApp",
          email: "Correo Electrónico",
          actions: "Acciones",
        },
      },
      contactModal: {
        title: {
          add: "Agregar contacto",
          edit: "Editar contacto",
        },
        form: {
          mainInfo: "Detalles del contacto",
          extraInfo: "Información adicional",
          name: "Nombre",
          number: "Número de Whatsapp",
          email: "Correo Electrónico",
          extraName: "Nombre del Campo",
          extraValue: "Valor",
        },
        buttons: {
          addExtraInfo: "Agregar información",
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Contacto guardado satisfactoriamente.",
      },
      quickAnswersModal: {
        title: {
          add: "Agregar respuesta rápida",
          edit: "Editar respuesta rápida",
        },
        form: {
          shortcut: "Atajo",
          message: "Respuesta rápida",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Respuesta rápida guardada correctamente.",
      },
      queueModal: {
        title: {
          add: "Agregar cola",
          edit: "Editar cola",
        },
        form: {
          name: "Nombre",
          color: "Color",
          greetingMessage: "Mensaje de saludo",
        },
        buttons: {
          okAdd: "Añadir",
          okEdit: "Ahorrar",
          cancel: "Cancelar",
        },
      },
      userModal: {
        title: {
          add: "Agregar usuario",
          edit: "Editar usuario",
        },
        form: {
          name: "Nombre",
          email: "Correo Electrónico",
          password: "Contraseña",
          profile: "Perfil",
          whatsapp: "Cuenta predeterminada",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Usuario guardado satisfactoriamente.",
      },
      chat: {
        noTicketMessage: "Selecciona una conversación para comenzar.",
      },
      ticketsManager: {
        buttons: {
          newTicket: "Nueva",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Colas",
      },
      tickets: {
        toasts: {
          deleted: "La conversación ha sido eliminada.",
        },
        notification: {
          message: "Mensaje de",
        },
        tabs: {
          open: { title: "Activas" },
          closed: { title: "Archivadas" },
          search: { title: "Buscar" },
        },
        search: {
          placeholder: "Buscar conversaciones...",
        },
        buttons: {
          showAll: "Todos",
        },
      },
      transferTicketModal: {
        title: "Transferir Conversación",
        fieldLabel: "Escriba para buscar usuarios",
        fieldQueueLabel: "Transferir a la cola",
        fieldConnectionLabel: "Transferir to conexión",
        fieldQueuePlaceholder: "Seleccione una cola",
        fieldConnectionPlaceholder: "Seleccione una conexión",
        noOptions: "No se encontraron usuarios con ese nombre",
        buttons: {
          ok: "Transferir",
          cancel: "Cancelar",
        },
      },
      ticketsList: {
        pendingHeader: "En espera",
        assignedHeader: "Mis chats",
        noTicketsTitle: "Sin conversaciones",
        connectionTitle: "Conexión activa",
        noTicketsMessage:
          "No hay conversaciones con este estado o término de búsqueda",
        buttons: {
          accept: "Acceptar",
        },
      },
      newTicketModal: {
        title: "Nueva Conversación",
        fieldLabel: "Escribe para buscar un contacto",
        add: "Añadir",
        buttons: {
          ok: "Guardar",
          cancel: "Cancelar",
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          connections: "Cuentas",
          tickets: "Conversaciones",
          contacts: "Contactos",
          quickAnswers: "Respuestas rápidas",
          queues: "Colas",
          aiAgents: "Agentes IA",
          contactForms: "Formularios",
          webchatChannels: "Webchat",
          closeReasons: "Tipificación",
          administration: "Administración",
          users: "Usuarios",
          settings: "Configuración",
        },
        appBar: {
          user: {
            profile: "Perfil",
            logout: "Cerrar Sesión",
          },
        },
      },
      notifications: {
        noTickets: "Sin notificaciones.",
      },
      queues: {
        title: "Colas",
        table: {
          name: "Nombre",
          color: "Color",
          greeting: "Mensaje de saludo",
          actions: "Comportamiento",
        },
        buttons: {
          add: "Agregar cola",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage:
            "¿Estás seguro? ¡Esta acción no se puede revertir! Los tickets en esa cola seguirán existiendo, pero ya no tendrán ninguna cola asignada.",
        },
      },
      queueSelect: {
        inputLabel: "Colas",
      },
      quickAnswers: {
        title: "Respuestas rápidas",
        table: {
          shortcut: "Atajo",
          message: "Respuesta rápida",
          actions: "Acciones",
        },
        buttons: {
          add: "Agregar respuesta rápida",
        },
        toasts: {
          deleted: "Respuesta rápida eliminada correctamente",
        },
        searchPlaceholder: "Buscar ...",
        confirmationModal: {
          deleteTitle:
            "¿Está seguro de que desea eliminar esta respuesta rápida?",
          deleteMessage: "Esta acción no se puede deshacer.",
        },
      },
      aiAgents: {
        title: "Agentes IA",
        table: {
          name: "Nombre",
          webhookUrl: "URL Webhook",
          status: "Estado",
          actions: "Acciones",
        },
        buttons: {
          add: "Agregar Agente IA",
        },
        toasts: {
          saved: "Agente IA guardado correctamente",
          deleted: "Agente IA eliminado correctamente",
        },
        status: {
          active: "Activo",
          inactive: "Inactivo",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "¿Estás seguro? Esta acción no se puede revertir.",
        },
      },
      aiAgentModal: {
        title: {
          add: "Agregar Agente IA",
          edit: "Editar Agente IA",
        },
        form: {
          name: "Nombre",
          webhookUrl: "URL del Webhook",
          apiToken: "Token de API (opcional)",
          isActive: "Agente Activo",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
      },
      users: {
        title: "Usuarios",
        table: {
          name: "Nombre",
          email: "Correo Electrónico",
          profile: "Perfil",
          whatsapp: "Cuenta predeterminada",
          actions: "Acciones",
        },
        buttons: {
          add: "Agregar usuario",
        },
        toasts: {
          deleted: "Usuario borrado satisfactoriamente.",
        },
        confirmationModal: {
          deleteTitle: "Borrar",
          deleteMessage:
            "Toda la información del usuario se perderá. Los tickets abiertos de los usuarios se moverán a la cola.",
        },
      },
      settings: {
        success: "Configuración guardada satisfactoriamente.",
        title: "Configuración",
        settings: {
          userCreation: {
            name: "Creación de usuarios",
            options: {
              enabled: "Habilitado",
              disabled: "Deshabilitado",
            },
          },
        },
      },
      messagesList: {
        header: {
          assignedTo: "Asignado a:",
          buttons: {
            return: "Devolver",
            resolve: "Resolver",
            reopen: "Reabrir",
            accept: "Aceptar",
          },
        },
      },
      messagesInput: {
        placeholderOpen: "Escriba un mensaje o presione '' / '' para usar las respuestas rápidas registradas",
        placeholderClosed:
          "Vuelva a abrir o acepte este ticket para enviar un mensaje.",
        signMessage: "Firmar",
      },
      contactDrawer: {
        header: "Detalles del contacto",
        buttons: {
          edit: "Editar contacto",
        },
        extraInfo: "Otra información",
      },
      ticketOptionsMenu: {
        delete: "Eliminar",
        transfer: "Transferir",
        confirmationModal: {
          title: "¿Eliminar conversación #",
          titleFrom: "de ",
          message:
            "¡Atención! Se perderán todos los mensajes de esta conversación.",
        },
        buttons: {
          delete: "Borrar",
          cancel: "Cancelar",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancelar",
        },
      },
      messageOptionsMenu: {
        delete: "Borrar",
        reply: "Responder",
        confirmationModal: {
          title: "¿Borrar mensaje?",
          message: "Esta acción no puede ser revertida.",
        },
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP:
          "Debe haber al menos una conexión de WhatsApp predeterminada.",
        ERR_NO_DEF_WAPP_FOUND:
          "No se encontró WhatsApp predeterminado. Verifique la página de conexiones.",
        ERR_WAPP_NOT_INITIALIZED:
          "Esta sesión de WhatsApp no ​​está inicializada. Verifique la página de conexiones.",
        ERR_WAPP_CHECK_CONTACT:
          "No se pudo verificar el contacto de WhatsApp. Verifique la página de conexiones.",
        ERR_WAPP_INVALID_CONTACT: "Este no es un número de whatsapp válido.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "No se pudieron descargar los medios de WhatsApp. Verifique la página de conexiones.",
        ERR_INVALID_CREDENTIALS: "Error de autenticación. Vuelva a intentarlo.",
        ERR_SENDING_WAPP_MSG:
          "Error al enviar el mensaje de WhatsApp. Verifique la página de conexiones.",
        ERR_DELETE_WAPP_MSG: "No se pudo borrar el mensaje de WhatsApp.",
        ERR_OTHER_OPEN_TICKET: "Ya hay un ticket abierto para este contacto.",
        ERR_SESSION_EXPIRED: "Sesión caducada. Inicie sesión.",
        ERR_USER_CREATION_DISABLED:
          "La creación de usuarios fue deshabilitada por el administrador.",
        ERR_NO_PERMISSION: "No tienes permiso para acceder a este recurso.",
        ERR_DUPLICATED_CONTACT: "Ya existe un contacto con este número.",
        ERR_NO_SETTING_FOUND:
          "No se encontró ninguna configuración con este ID.",
        ERR_NO_CONTACT_FOUND: "No se encontró ningún contacto con este ID.",
        ERR_NO_TICKET_FOUND: "No se encontró ningún ticket con este ID.",
        ERR_NO_USER_FOUND: "No se encontró ningún usuario con este ID.",
        ERR_NO_WAPP_FOUND: "No se encontró WhatsApp con este ID.",
        ERR_CREATING_MESSAGE: "Error al crear el mensaje en la base de datos.",
        ERR_CREATING_TICKET: "Error al crear el ticket en la base de datos.",
        ERR_FETCH_WAPP_MSG:
          "Error al obtener el mensaje en WhtasApp, tal vez sea demasiado antiguo.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "Este color ya está en uso, elija otro.",
        ERR_WAPP_GREETING_REQUIRED:
          "El mensaje de saludo es obligatorio cuando hay más de una cola.",
      },
      companies: {
        title: "Empresas",
        toasts: {
          deleted: "Empresa eliminada con éxito.",
          created: "Empresa creada con éxito.",
          updated: "Empresa actualizada con éxito.",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "¿Estás seguro? Todos los datos de esta empresa serán eliminados.",
        },
        buttons: {
          add: "Nueva Empresa",
          viewUsers: "Ver Usuarios",
        },
        table: {
          name: "Nombre",
          slug: "Identificador",
          plan: "Plan",
          status: "Estado",
          actions: "Acciones",
          active: "Activo",
          inactive: "Inactivo",
        },
      },
      companyModal: {
        title: {
          add: "Crear Empresa",
          edit: "Editar Empresa",
        },
        form: {
          name: "Nombre de la empresa",
          slug: "Identificador único",
          slugHelp: "URL amigable, ej: mi-empresa",
          plan: "Plan",
          maxUsers: "Máximo de usuarios",
          maxWhatsapps: "Máximo de conexiones",
          isActive: "Empresa activa",
        },
        buttons: {
          cancel: "Cancelar",
          create: "Crear",
          update: "Guardar",
        },
      },
      companyUsersModal: {
        title: "Usuarios",
        noUsers: "No hay usuarios en esta empresa.",
        users: "usuarios",
        addUser: "Agregar nuevo usuario",
        bulkImport: "Importar usuarios masivamente",
        bulkFormat: "Formato CSV: nombre,email,contraseña,perfil (uno por línea)",
        confirmDelete: "¿Estás seguro de que deseas eliminar este usuario?",
        validation: {
          required: "Nombre, email y contraseña son requeridos",
          bulkEmpty: "El texto de importación está vacío",
          invalidFormat: "Formato inválido. Use: nombre,email,contraseña,perfil",
        },
        toasts: {
          created: "Usuario creado exitosamente",
          deleted: "Usuario eliminado exitosamente",
          bulkCreated: "{{created}} usuarios creados, {{errors}} errores",
        },
        buttons: {
          addUser: "Agregar Usuario",
          bulkImport: "Importar CSV",
          create: "Crear Usuario",
          importAll: "Importar Todos",
        },
      },
      roles: {
        title: "Roles y Permisos",
        subtitle: "Administra los roles y permisos del sistema",
        table: {
          name: "Nombre",
          description: "Descripción",
          users: "Usuarios",
          system: "Sistema",
          actions: "Acciones",
        },
        buttons: {
          add: "Nuevo Rol",
        },
        toasts: {
          created: "Rol creado exitosamente",
          updated: "Rol actualizado exitosamente",
          deleted: "Rol eliminado exitosamente",
        },
        confirmationModal: {
          deleteTitle: "Eliminar Rol",
          deleteMessage: "¿Estás seguro? Esta acción no se puede revertir.",
        },
        errors: {
          inUse: "No se puede eliminar un rol que está siendo usado",
          systemRole: "No se puede eliminar un rol del sistema",
        },
      },
      roleModal: {
        title: {
          add: "Crear Rol",
          edit: "Editar Rol",
        },
        form: {
          name: "Nombre del rol",
          description: "Descripción",
          permissions: "Permisos",
        },
        modules: {
          tickets: "Conversaciones",
          contacts: "Contactos",
          users: "Usuarios",
          queues: "Colas",
          connections: "Cuentas",
          quickAnswers: "Respuestas Rápidas",
          settings: "Configuración",
          reports: "Reportes",
          campaigns: "Campañas",
          aiAgents: "Agentes IA",
        },
        buttons: {
          cancel: "Cancelar",
          save: "Guardar",
        },
      },
      contactForms: {
        title: "Formularios",
        searchPlaceholder: "Buscar formularios...",
        table: {
          name: "Nombre",
          fields: "Campos",
          status: "Estado",
          actions: "Acciones",
        },
        status: {
          active: "Activo",
          inactive: "Inactivo",
        },
        buttons: {
          add: "Nuevo Formulario",
        },
        toasts: {
          deleted: "Formulario eliminado correctamente",
        },
        confirmationModal: {
          deleteTitle: "¿Eliminar formulario",
          deleteMessage: "Esta acción eliminará el formulario y todas sus respuestas. No se puede deshacer.",
        },
      },
      contactFormModal: {
        title: {
          add: "Crear Formulario",
          edit: "Editar Formulario",
        },
        form: {
          name: "Nombre del formulario",
          description: "Descripción",
          active: "Formulario activo",
          fields: "Campos del formulario",
          field: "Campo",
          fieldType: "Tipo",
          fieldLabel: "Etiqueta",
          placeholder: "Texto de ayuda",
          options: "Opciones",
          optionsHelp: "Separar opciones con comas",
          required: "Requerido",
        },
        buttons: {
          addField: "Agregar Campo",
          cancel: "Cancelar",
          okAdd: "Crear",
          okEdit: "Guardar",
        },
        success: {
          add: "Formulario creado correctamente",
          edit: "Formulario actualizado correctamente",
        },
      },
      contactFormFiller: {
        title: "Llenar Formulario",
        selectForm: "Seleccionar formulario",
        noForms: "No hay formularios disponibles",
        success: "Respuesta enviada correctamente",
        buttons: {
          cancel: "Cancelar",
          submit: "Enviar",
        },
      },
      webchatChannels: {
        title: "Canales Webchat",
        confirmDelete: "¿Estás seguro de que deseas eliminar este canal? Esta acción no se puede revertir.",
        noChannels: "No hay canales de webchat. Crea uno para empezar.",
        table: {
          name: "Nombre",
          color: "Color",
          status: "Estado",
          actions: "Acciones",
        },
        buttons: {
          add: "Nuevo Canal",
        },
        modal: {
          titleAdd: "Crear Canal Webchat",
          titleEdit: "Editar Canal Webchat",
          name: "Nombre",
          active: "Canal activo",
          color: "Color primario",
          position: "Posición",
          buttonText: "Texto del botón",
          welcomeMessage: "Mensaje de bienvenida",
          offlineMessage: "Mensaje fuera de línea",
          allowedDomains: "Dominios permitidos",
          cancel: "Cancelar",
          save: "Guardar",
        },
      },
      closeReasons: {
        title: "Motivos de Cierre",
        table: {
          name: "Nombre",
          category: "Categoría",
          form: "Formulario",
          status: "Estado",
          actions: "Acciones",
        },
        categories: {
          positive: "Positivo",
          negative: "Negativo",
        },
        status: {
          active: "Activo",
          inactive: "Inactivo",
        },
        buttons: {
          add: "Nuevo Motivo",
        },
        toasts: {
          created: "Motivo de cierre creado correctamente",
          updated: "Motivo de cierre actualizado correctamente",
          deleted: "Motivo de cierre desactivado correctamente",
        },
        confirmationModal: {
          deleteTitle: "¿Desactivar motivo",
          deleteMessage: "Esta acción desactivará el motivo de cierre. Los tickets existentes mantendrán su historial.",
        },
        modal: {
          addTitle: "Crear Motivo de Cierre",
          editTitle: "Editar Motivo de Cierre",
          name: "Nombre",
          description: "Descripción",
          category: "Categoría",
          color: "Color",
          order: "Orden",
          associatedForm: "Formulario asociado",
          noForm: "Sin formulario",
          active: "Motivo activo",
          cancel: "Cancelar",
          add: "Crear",
          save: "Guardar",
        },
      },
      resolveTicketModal: {
        title: "Tipificar Conversación",
        noReasons: "No hay motivos de cierre configurados. Contacte al administrador.",
        formRequired: "Este motivo requiere completar un formulario",
        formCompleted: "Formulario completado",
        fillForm: "Completar formulario",
        cancel: "Cancelar",
        confirm: "Cerrar Conversación",
      },
      connectionConfig: {
        title: "Configuración de Conexión",
        tabs: {
          closeReasons: "Tipificaciones",
          contactForms: "Formularios",
        },
        buttons: {
          addCloseReason: "Nueva Tipificación",
          addContactForm: "Nuevo Formulario",
        },
        noCloseReasons: "No hay tipificaciones configuradas para esta conexión.",
        noContactForms: "No hay formularios configurados para esta conexión.",
        confirmDelete: {
          title: "¿Eliminar?",
          message: "Esta acción no se puede deshacer.",
        },
      },
    },
  },
};

export { messages };


