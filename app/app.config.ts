import alert from './config/nuxt-ui/alert';
import badge from './config/nuxt-ui/badge';
import button from './config/nuxt-ui/button';
import card from './config/nuxt-ui/card';
import container from './config/nuxt-ui/container';
import empty from './config/nuxt-ui/empty';
import input from './config/nuxt-ui/input';
import main from './config/nuxt-ui/main';
import select from './config/nuxt-ui/select';
import skeleton from './config/nuxt-ui/skeleton';
import toast from './config/nuxt-ui/toast';
import toaster from './config/nuxt-ui/toaster';

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate'
    },
    alert,
    badge,
    button,
    card,
    container,
    empty,
    input,
    main,
    select,
    skeleton,
    toast,
    toaster
  }
});
