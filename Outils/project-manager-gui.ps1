Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Création du formulaire
$form = New-Object System.Windows.Forms.Form
$form.Text = "Gestionnaire TeamsRooms"
$form.Size = New-Object System.Drawing.Size(400,300)
$form.StartPosition = "CenterScreen"

# Boutons
$btnInstallClient = New-Object System.Windows.Forms.Button
$btnInstallClient.Location = New-Object System.Drawing.Point(20,20)
$btnInstallClient.Size = New-Object System.Drawing.Size(150,30)
$btnInstallClient.Text = "Installation Client"
$btnInstallClient.Add_Click({
    Start-Process "project-manager.bat" -ArgumentList "install-client" -NoNewWindow
})
$form.Controls.Add($btnInstallClient)

$btnSync = New-Object System.Windows.Forms.Button
$btnSync.Location = New-Object System.Drawing.Point(20,60)
$btnSync.Size = New-Object System.Drawing.Size(150,30)
$btnSync.Text = "Synchroniser"
$btnSync.Add_Click({
    Start-Process "project-manager.bat" -ArgumentList "sync" -NoNewWindow
})
$form.Controls.Add($btnSync)

# Zone de texte pour les logs
$txtLogs = New-Object System.Windows.Forms.TextBox
$txtLogs.Multiline = $true
$txtLogs.Location = New-Object System.Drawing.Point(20,100)
$txtLogs.Size = New-Object System.Drawing.Size(350,120)
$txtLogs.ScrollBars = "Vertical"
$txtLogs.ReadOnly = $true
$form.Controls.Add($txtLogs)

# Timer pour rafraîchir les logs
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 1000
$timer.Add_Tick({
    $txtLogs.Text = Get-Content "project-manager.log" -Tail 10 -Wait
})
$timer.Start()

# Affichage du formulaire
$form.Add_Shown({$form.Activate()})
[void] $form.ShowDialog()