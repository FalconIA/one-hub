import React, { forwardRef } from 'react';
import Box from '@mui/material/Box';
import { iconToSVG } from '@iconify/utils/lib/svg/build';

// 导入本地图标集
const iconSets = {};
const iconSetPromises = {};

async function loadIconSet(prefix) {
  if (iconSets[prefix]) {
    return iconSets[prefix];
  }
  
  if (!iconSetPromises[prefix]) {
    iconSetPromises[prefix] = import(`../../assets/icons/${prefix}.json`)
      .then(module => {
        iconSets[prefix] = module.default;
        return iconSets[prefix];
      });
  }
  
  return iconSetPromises[prefix];
}

const LocalIcon = forwardRef(({ icon, width = 20, height, color, ...other }, ref) => {
  const [svg, setSvg] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    async function loadIcon() {
      try {
        const [prefix, name] = icon.split(':');
        const iconSet = await loadIconSet(prefix);
        
        if (!iconSet.icons[name]) {
          console.error(`Icon ${icon} not found`);
          return;
        }
        
        const iconData = iconSet.icons[name];
        const svgData = iconToSVG(iconData, {
          height: height || width,
          width
        });
        
        // 添加完整的 SVG 标签
        const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height || width}" viewBox="0 0 ${iconSet.width || 24} ${iconSet.height || 24}">${svgData.body}</svg>`;
        setSvg(fullSvg);
      } catch (error) {
        console.error(`Error loading icon ${icon}:`, error);
      } finally {
        setLoading(false);
      }
    }
    
    loadIcon();
  }, [icon, width, height]);
  
  if (loading) {
    return null;
  }
  
  return (
    <Box
      ref={ref}
      component="span"
      sx={{
        width,
        height: height || width,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& svg': {
          width: '100%',
          height: '100%',
          color
        }
      }}
      {...other}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
});

export default LocalIcon; 