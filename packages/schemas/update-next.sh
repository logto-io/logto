CURRENT_VERSION=$(node -p "require('./package.json').version.replaceAll('-', '_')")

cd alterations

for x in next-*.ts;
do
  [ -e "$x" ] || continue; # Skip when no file found (will still loop $x with "next-*.ts")
  mv $x $CURRENT_VERSION$(echo ${x#next});
done
