#!/bin/zsh
cd -- "${0:A:h}" || exit 1
if command -v python3 >/dev/null 2>&1; then
  python3 '启动服务.py'
else
  print '未找到 Python 3。仍可双击 index.html 离线使用；局域网服务需要教师电脑安装 Python 3。'
fi
read '?按回车关闭窗口。'
