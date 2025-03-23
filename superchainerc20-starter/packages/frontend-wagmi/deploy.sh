npm run build

rsync -a dist/ ../../../../crosswap-op-interop-demo/
cd ../../../../crosswap-op-interop-demo/
git add .
git commit -m "deploy frontend-wagmi"
git push origin main