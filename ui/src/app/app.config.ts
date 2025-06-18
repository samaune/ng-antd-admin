import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import zh from '@angular/common/locales/zh';
import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection, inject, provideAppInitializer, EnvironmentProviders, DOCUMENT } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, RouteReuseStrategy, TitleStrategy, withComponentInputBinding, withHashLocation, withInMemoryScrolling, withPreloading, withViewTransitions } from '@angular/router';

import { DashboardOutline, FormOutline, MenuFoldOutline, MenuUnfoldOutline } from '@ant-design/icons-angular/icons';
import { appRoutes } from '@app/app-routing';
import { CustomPageTitleResolverService } from '@core/services/common/custom-page-title-resolver.service';
import { InitThemeService } from '@core/services/common/init-theme.service';
import { LoadAliIconCdnService } from '@core/services/common/load-ali-icon-cdn.service';
import { SimpleReuseStrategy } from '@core/services/common/reuse-strategy';
import { ScrollService } from '@core/services/common/scroll.service';
import { SelectivePreloadingStrategyService } from '@core/services/common/selective-preloading-strategy.service';
import { SubLockedStatusService } from '@core/services/common/sub-locked-status.service';
import { SubWindowWithService } from '@core/services/common/sub-window-with.service';
import { ThemeSkinService } from '@core/services/common/theme-skin.service';
import { httpInterceptorService } from '@core/services/interceptors/http-interceptor';
import { StartupService } from '@core/startup/startup.service';
import { getDeepReuseStrategyKeyFn } from '@utils/tools';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NZ_I18N, zh_CN } from 'ng-zorro-antd/i18n';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';

const icons = [MenuFoldOutline, MenuUnfoldOutline, DashboardOutline, FormOutline];

registerLocaleData(zh);

export function StartupServiceFactory(startupService: StartupService) {
  return () => startupService.load();
}

export function LoadAliIconCdnFactory(loadAliIconCdnService: LoadAliIconCdnService) {
  return () => loadAliIconCdnService.load();
}

export function InitThemeServiceFactory(initThemeService: InitThemeService) {
  return async (): Promise<void> => await initThemeService.initTheme();
}

// 监听锁屏状态
export function InitLockedStatusServiceFactory(subLockedStatusService: SubLockedStatusService) {
  return () => subLockedStatusService.initLockedStatus();
}

// 开启监听屏幕宽度
export function SubWindowWithServiceFactory(subWindowWithService: SubWindowWithService) {
  return () => subWindowWithService.subWindowWidth();
}

const APPINIT_PROVIDES: EnvironmentProviders[] = [
  // 项目启动
  provideAppInitializer(() => {
    const initializerFn = StartupServiceFactory(inject(StartupService));
    return initializerFn();
  }),
  // load阿里图标库cdn
  provideAppInitializer(() => {
    const initializerFn = LoadAliIconCdnFactory(inject(LoadAliIconCdnService));
    return initializerFn();
  }),
  // 初始化锁屏服务
  provideAppInitializer(() => {
    const initializerFn = InitLockedStatusServiceFactory(inject(SubLockedStatusService));
    return initializerFn();
  }),
  // 初始化主题
  provideAppInitializer(() => {
    const initializerFn = InitThemeServiceFactory(inject(InitThemeService));
    return initializerFn();
  }),
  // 初始化监听屏幕宽度服务
  provideAppInitializer(() => {
    const initializerFn = SubWindowWithServiceFactory(inject(SubWindowWithService));
    return initializerFn();
  }),
  // 初始化暗黑模式还是default模式的css
  provideAppInitializer(() => {
    const initializerFn = ((themeService: ThemeSkinService) => () => {
      return themeService.loadTheme();
    })(inject(ThemeSkinService));
    return initializerFn();
  })
];

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: SimpleReuseStrategy, deps: [DOCUMENT, ScrollService] }, // 路由复用
    {
      provide: TitleStrategy, // 相关资料：https://dev.to/brandontroberts/setting-page-titles-natively-with-the-angular-router-393j
      useClass: CustomPageTitleResolverService // 自定义路由切换时，浏览器title的显示，在ng14以上支持。旧版本使用方式请看我的github v16tag以下版本代码
    },
    { provide: NZ_I18N, useValue: zh_CN }, // zorro国际化
    { provide: NZ_ICONS, useValue: icons }, // zorro图标
    provideRouter(
      appRoutes, // 路由
      withPreloading(SelectivePreloadingStrategyService), // 自定义模块预加载
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition, from }) => {
          const fromSource = getDeepReuseStrategyKeyFn(from, false);
          if (fromSource === 'refresh-empty') {
            // 刷新tab或者切换“是否展示tab”时禁用过渡动画，否则页面tab栏会闪烁
            transition.skipTransition();
          }
        }
      }), // 路由切换过渡，ng17新增实验性特性参考资料https://netbasal.com/angular-v17s-view-transitions-navigate-in-elegance-f2d48fd8ceda
      withInMemoryScrolling({
        scrollPositionRestoration: 'top'
      }),
      withHashLocation(), // 使用哈希路由
      withComponentInputBinding() // 开启路由参数绑定到组件的输入属性,ng16新增特性
    ),
    importProvidersFrom(NzDrawerModule, NzModalModule),
    ...APPINIT_PROVIDES, // 项目启动之前，需要调用的一系列方法
    provideAnimationsAsync(), // 开启延迟加载动画，ng17新增特性，如果想要项目启动时就加载动画，可以使用provideAnimations()
    provideHttpClient(withInterceptors([httpInterceptorService])),
    provideZonelessChangeDetection() // 开启 zoneless
  ]
};
