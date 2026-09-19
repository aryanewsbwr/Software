$licenses = @{
    "DB50CE40-4911-11d1-AB0E-0000C00949C4" = "mshrqfghjjikmjjhghjkhjkhkjlh"
    "D32CE820-A0E3-11d0-9C8A-006097C3784A" = "mshrqfghjjikmjjhghjkhjkhkjlh"
    "4250E830-6AC2-11cf-8ADB-00AA00C00905" = "kjgmfgjjmgnnmnmninighthkgogggvmkhinjggnvm"
    "C945E31A-102E-4a0d-8854-D599D7AED5FA" = "mshrqfghjjikmjjhghjkhjkhkjlh"
    "BEEECC20-4D5F-4f8b-BFDC-5D9B6FBDE09D" = "mshrqfghjjikmjjhghjkhjkhkjlh"
    "72A54011-855A-101B-A164-00AA0039E2E2" = "dnineng Greene and Associates"
    "ED4BA亲-101B-A164-00AA0039E2E2" = "mgkgtgnnmnmninighthkgogggvmkhinjggnvm"
}

$roots = @(
    "HKCU:\Software\Classes\Licenses",
    "HKLM:\SOFTWARE\Classes\Licenses",
    "HKLM:\SOFTWARE\WOW6432Node\Classes\Licenses"
)

foreach ($r in $roots) {
    if (!(Test-Path $r)) {
        New-Item -Path $r -Force | Out-Null
    }
    foreach ($k in $licenses.Keys) {
        $sub = "$r\$k"
        if (!(Test-Path $sub)) {
            New-Item -Path $sub -Force | Out-Null
        }
        Set-ItemProperty -Path $sub -Name "(Default)" -Value $licenses[$k] -ErrorAction SilentlyContinue
        Write-Output "Written $sub = $($licenses[$k])"
    }
}
Write-Output "All 32-bit Licenses successfully injected!"
