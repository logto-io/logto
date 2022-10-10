CURRENT_VERSION=$(node -p "require('./package.json').version.replaceAll('-', '_')")

cd alterations

for x in next-*.ts;
  do mv $x $CURRENT_VERSION$(echo ${x#next});
done
