' VBScript to create desktop shortcut for Africa Pharmacy
' This creates a proper Windows desktop icon

Dim objShell, objDesktop, objShortcut
Dim strDesktopPath, strAppPath

Set objShell = CreateObject("WScript.Shell")
strDesktopPath = objShell.SpecialFolders("Desktop")
strAppPath = objShell.CurrentDirectory

' Create shortcut
Set objShortcut = objShell.CreateShortcut(strDesktopPath & "\Africa Pharmacy.lnk")

' Set shortcut properties
objShortcut.TargetPath = strAppPath & "\AfricaPharmacy.bat"
objShortcut.WorkingDirectory = strAppPath
objShortcut.WindowStyle = 1
objShortcut.IconLocation = strAppPath & "\icon.ico, 0"
objShortcut.Description = "Africa Pharmacy Management System"
objShortcut.Hotkey = "CTRL+ALT+P"

' Save the shortcut
objShortcut.Save

' Success message
MsgBox "Desktop shortcut created successfully!" & vbCrLf & vbCrLf & _
       "You can now start Africa Pharmacy by double-clicking" & vbCrLf & _
       "the icon on your desktop.", vbInformation, "Africa Pharmacy"

' Clean up
Set objShortcut = Nothing
Set objShell = Nothing