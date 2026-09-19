$sig = @'
[DllImport("kernel32.dll", SetLastError = true)]
public static extern IntPtr LoadLibrary(string lpLibFileName);
'@
$type = Add-Type -MemberDefinition $sig -Name Kernel32Test -Namespace Win32Test -PassThru

$paths = @(
    "C:\Windows\SysWOW64\vsflex8.ocx",
    "B:\himanshu uncle\exe\vsflex8.ocx",
    "B:\himanshu uncle\MSCAL.OCX",
    "C:\Windows\SysWOW64\mscomctl.ocx",
    "C:\Windows\SysWOW64\msmask32.ocx"
)

foreach ($p in $paths) {
    $h = $type::LoadLibrary($p)
    $err = [System.Runtime.InteropServices.Marshal]::GetLastWin32Error()
    Write-Output "File: $p -> Handle: $h | Win32Error: $err"
}
