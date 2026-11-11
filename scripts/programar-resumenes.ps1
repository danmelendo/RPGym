# Programa el resumen quincenal en ESTE PC, con la sesión de Claude que ya tienes
# iniciada (la de tu suscripción). Sin API key ni token en GitHub: no hay gasto
# aparte del plan.
#
# Se lanza cada lunes a las 10:00. Si el PC está apagado a esa hora, se lanza en
# cuanto se encienda (StartWhenAvailable). Va cada semana porque el propio script
# se salta a quien recibió uno hace menos de 13 días: el ritmo real es quincenal.
#
# Uso (una vez):    powershell -ExecutionPolicy Bypass -File scripts\programar-resumenes.ps1
# Quitarlo:         Unregister-ScheduledTask -TaskName "RPGym resumenes" -Confirm:$false
# Probarlo ya:      Start-ScheduledTask -TaskName "RPGym resumenes"
# Registro:         %LOCALAPPDATA%\RPGym\resumenes.log  (solo recuentos, sin datos)

$repo = Split-Path -Parent $PSScriptRoot
$node = (Get-Command node -ErrorAction Stop).Source
$logDir = Join-Path $env:LOCALAPPDATA "RPGym"
New-Item -ItemType Directory -Force $logDir | Out-Null
$log = Join-Path $logDir "resumenes.log"

$cmd = "cd /d `"$repo`" && echo ==== %DATE% %TIME% >> `"$log`" && `"$node`" --env-file=.env scripts\resumen-quincenal.mjs >> `"$log`" 2>&1"
$accion = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c $cmd"
$cuando = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 10:00
$ajustes = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 1)
# Con tu usuario y solo con la sesión abierta: `claude` lee tu login de tu perfil.
$quien = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName "RPGym resumenes" -Action $accion -Trigger $cuando -Settings $ajustes -Principal $quien `
  -Description "Resumen quincenal de entrenos con claude -p (suscripción, sin API key). Ver scripts/resumen-quincenal.mjs" -Force | Out-Null

Write-Host "Tarea 'RPGym resumenes' programada: lunes 10:00. Registro en $log"
