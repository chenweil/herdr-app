#!/usr/bin/env bash
set -euo pipefail

package_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
app_home="${HERDR_APP_HOME:-$HOME/.config/herdr-app}"

if ! command -v herdr-app >/dev/null 2>&1; then
  printf '❌ 未找到 herdr-app，请先安装并确保它在 PATH 中。\n' >&2
  exit 1
fi

mkdir -p "$app_home/layouts" "$app_home/mods"
cp "$package_dir/layouts/along.json" "$app_home/layouts/along.json"
printf '✅ 已安装布局：%s\n' "$app_home/layouts/along.json"

for source in "$package_dir"/mods/*; do
  [ -d "$source" ] || continue
  name="$(basename "$source")"
  mkdir -p "$app_home/mods/$name"
  cp -R "$source/." "$app_home/mods/$name/"
  printf '✅ 已安装 mod：%s\n' "$app_home/mods/$name"
done

cp "$package_dir/README.md" "$package_dir/RECIPE.md" \
  "$package_dir/LICENSE" "$package_dir/NOTICE" "$app_home/"
printf '✅ 已安装说明文档与许可证：%s\n' "$app_home"

failed=0
for source in "$package_dir"/mods/*; do
  [ -d "$source" ] || continue
  name="$(basename "$source")"
  if herdr-app check "$app_home/mods/$name"; then
    printf '✅ %s 校验成功\n' "$name"
  else
    printf '❌ %s 校验失败\n' "$name" >&2
    failed=1
  fi
done

if [ "$failed" -ne 0 ]; then
  printf '❌ 部分 mod 校验失败，安装未完成。\n' >&2
  exit 1
fi

printf '✅ Along 安装完成。\n'
