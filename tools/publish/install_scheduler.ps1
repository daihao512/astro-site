# LubandArt Auto Publisher — Windows 任务计划程序安装脚本
# 以当前用户身份创建定时任务：每 10 分钟 + 开机时轮询 queue/。
# 发布动作完全自动，正常 Runtime 不需要用户参与。
#
# 用法（PowerShell，管理员或当前用户均可）：
#   powershell -ExecutionPolicy Bypass -File "F:/free site/tools/publish/install_scheduler.ps1"
#
# 卸载：
#   Unregister-ScheduledTask -TaskName "LubandArtAutoPublisher" -Confirm:$false

$ErrorActionPreference = "Stop"

# Python：优先用绝对路径（WorkBuddy 托管 Python，免装环境）
$PY = "C:\Users\Administrator\.workbuddy\binaries\python\versions\3.13.12\python.exe"
if (-not (Test-Path $PY)) {
    # 回退到 PATH 中的 python
    $pyOnPath = Get-Command python -ErrorAction SilentlyContinue
    if ($pyOnPath) { $PY = $pyOnPath.Source } else { throw "python 未找到，请先安装 Python 3.13+" }
}

$Script = "F:/free site/tools/publish/local_publisher.py"
$WorkDir = "F:/free site"

$action = New-ScheduledTaskAction `
    -Execute $PY `
    -Argument $Script `
    -WorkingDirectory $WorkDir

# 触发器1：开机启动后延迟1分钟
$triggerBoot = New-ScheduledTaskTrigger -AtStartup
$triggerBoot.Delay = [TimeSpan]::FromMinutes(1)

# 触发器2：每 10 分钟重复（无限）
$triggerRep = New-ScheduledTaskTrigger -Once -At (Get-Date)
$triggerRep.RepetitionInterval = [TimeSpan]::FromMinutes(10)
$triggerRep.RepetitionDuration = [TimeSpan]::Zero   # 0 = 无限重复

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingToBattery `
    -ExecutionTimeLimit ([TimeSpan]::FromMinutes(30) ) `
    -MultipleInstances IgnoreNew `
    -StartWhenAvailable

# 以当前登录用户运行（继承 GCM 凭据缓存 + 代理环境 + F: 盘访问）。
# 不指定 -User/-Password：避免无口令的非交互上下文报错；任务在本用户登录态下运行
# （满足"开机后 + 每 10 分钟"自动巡检；关机/登出期间不触发，符合本机常在线场景）。
Register-ScheduledTask `
    -TaskName "LubandArtAutoPublisher" `
    -Action $action `
    -Trigger @($triggerBoot, $triggerRep) `
    -Settings $settings `
    -Force

Write-Host "TASK_CREATED: LubandArtAutoPublisher (every 10 min + at startup, user=$env:USERNAME)"
Write-Host "Next runs will auto-publish any APPROVED manifest in tools/publish/queue/"
