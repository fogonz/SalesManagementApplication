# Instalación automática de OpenSSH Server en Windows

Para que tu programa pueda instalar y arrancar el servidor SSH automáticamente en Windows, asegúrate de cumplir estos requisitos:

## Requisitos del sistema

- **Windows 10/11** (versión moderna, con PowerShell)
- **Permisos de administrador** para instalar y arrancar servicios

## Requisitos de Python

Agrega estas dependencias a tu `requirements.txt`:

```
sshtunnel
mysqlclient
```

> Ya tienes estas dependencias en tu `requirements.txt` si seguiste los pasos anteriores.

## ¿Qué hace el backend?

- Usa PowerShell para instalar OpenSSH Server:
  ```
  Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
  ```
- Usa PowerShell para arrancar el servicio:
  ```
  Start-Service -Name sshd
  ```
- Usa PowerShell para consultar el estado:
  ```
  Get-Service -Name sshd
  ```

## Pasos para el usuario

1. **Ejecuta tu backend (Django) como administrador** (clic derecho → Ejecutar como administrador).
2. En la interfaz, selecciona "Soy el Host".
3. Si OpenSSH no está instalado, pulsa el botón "Instalar OpenSSH Server".
4. Si OpenSSH está instalado pero no iniciado, pulsa "Iniciar OpenSSH Server".
5. Comparte tu IP pública, usuario y contraseña de Windows con el cliente.

## Notas

- Si la instalación falla, asegúrate de tener permisos de administrador.
- El backend solo puede instalar OpenSSH Server en la misma máquina donde corre.
- El cliente podrá conectarse usando SSH Tunnel una vez que el servicio esté corriendo.

---
