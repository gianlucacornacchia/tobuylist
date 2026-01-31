# deploy.ps1
# Safe deployment script for tobuy-list

Write-Host "Checking for uncommitted changes..." -ForegroundColor Cyan
$status = git status --porcelain
if ($status) {
    Write-Host "Error: You have uncommitted changes. Please commit or stash them before deploying." -ForegroundColor Red
    Write-Host $status
    exit 1
}

Write-Host "Checking for unpushed commits..." -ForegroundColor Cyan
$unpushed = git cherry -v
if ($unpushed) {
    Write-Host "Pushing unpushed commits to origin..." -ForegroundColor Yellow
    git push
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to push commits. Deployment aborted." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "No unpushed commits." -ForegroundColor Green
}

Write-Host "Starting deployment..." -ForegroundColor Cyan
npm run deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}
