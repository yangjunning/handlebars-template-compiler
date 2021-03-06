import fs from 'fs-extra';
import handlebars from 'handlebars';
import recursive from 'recursive-readdir';
import micromatch from 'micromatch';

interface IOption {
  /**
   * glob pattern for exclude files
   */
  exclude?: readonly string[] | string;
  /**
   * template file suffix
   */
  tplSuffix?: string;
}

const compiler = async <TMeta>(
  meta: TMeta,
  rootDir: string,
  option: IOption = {
    tplSuffix: 'tpl',
  }
): Promise<void> => {
  const { tplSuffix, exclude } = option;
  const files = await recursive(rootDir);
  files.forEach(file => {
    const isInclude = tplSuffix ? micromatch.isMatch(file, `**/*.${tplSuffix}.*`) : true;
    const isExclude = exclude && micromatch.isMatch(file, exclude);
    if (isExclude) {
      return;
    }
    if (isInclude) {
      const content = fs.readFileSync(file).toString();
      const result = handlebars.compile(content)(meta);

      fs.writeFileSync(file, result);
      const newPath = file
        .split('.')
        .filter(path => path !== tplSuffix)
        .join('.');
      fs.renameSync(file, newPath);
    }
  });
};

export = compiler;
