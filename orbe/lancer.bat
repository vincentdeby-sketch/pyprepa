@echo off
rem Orbe Local : double-cliquez sur ce fichier.
cd /d "%~dp0"
if not exist .venv\installe.ok (
  echo Premiere installation : quelques minutes...
  if not exist .venv\Scripts\python.exe py -3.12 -m venv .venv 2>nul
  if not exist .venv\Scripts\python.exe py -3.13 -m venv .venv 2>nul
  if not exist .venv\Scripts\python.exe py -3 -m venv .venv 2>nul
  if not exist .venv\Scripts\python.exe python -m venv .venv
  if not exist .venv\Scripts\python.exe (
    echo Python est introuvable. Installez Python 3.12 depuis python.org en cochant "Add python.exe to PATH".
    pause
    exit /b 1
  )
  .venv\Scripts\python -m pip install --upgrade pip
  .venv\Scripts\python -m pip install -r requirements.txt || (echo L installation a echoue, relancez ce fichier. & pause & exit /b 1)
  echo ok> .venv\installe.ok
)
.venv\Scripts\python lancer.py
pause
