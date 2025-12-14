const sharp = require('sharp');

const applyFilter = (imageBuffer, filterName) => {
  let image = sharp(imageBuffer);

  switch (filterName) {
    case 'vivid':
      // 鲜明: 提高饱和度和对比度
      image = image.modulate({ saturation: 1.5, brightness: 1.05 }).gamma();
      break;
    case 'vivid_warm':
      // 鲜暖色: 在鲜明基础上增加暖色调
      image = image.modulate({ saturation: 1.5, brightness: 1.05 }).gamma().tint({ r: 255, g: 230, b: 180, a: 0.1 });
      break;
    case 'vivid_cool':
      // 鲜冷色: 在鲜明基础上增加冷色调
      image = image.modulate({ saturation: 1.5, brightness: 1.05 }).gamma().tint({ r: 170, g: 200, b: 255, a: 0.1 });
      break;
    case 'dramatic':
      // 反差色: 大幅提高对比度，可能转为灰度
      image = image.linear(1.5, -128).gamma(2);
      break;
    case 'dramatic_warm':
      // 反差暖色: 在反差色基础上增加暖色调
      image = image.linear(1.5, -128).gamma(2).tint({ r: 255, g: 190, b: 100, a: 0.15 });
      break;
    case 'dramatic_cool':
      // 反差冷色: 在反差色基础上增加冷色调
      image = image.linear(1.5, -128).gamma(2).tint({ r: 100, g: 150, b: 255, a: 0.15 });
      break;
    case 'mono':
      // 单色
      image = image.grayscale();
      break;
    case 'silvertone':
      // 银色调: 类似黑白，但对比度和色调略有不同
      image = image.grayscale().tint({ r: 150, g: 150, b: 150, a: 0.1 });
      break;
    case 'noir':
      // 黑白: 高对比度黑白
      image = image.grayscale().gamma(3);
      break;
    default:
      // 如果滤镜名称不匹配，则不应用任何滤镜
      break;
  }

  return image;
};

module.exports = { applyFilter };