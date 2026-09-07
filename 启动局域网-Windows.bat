@echo off
chcp 65001 >nul
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 "启动服务.py"
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo 未找到 Python 3。可先双击 index.html 离线使用。
    echo 如需局域网服务，请在教师电脑安装 Python 3。
  ) else (
    python "启动服务.py"
  )
)
pause
