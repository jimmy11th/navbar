import { Layout, Model } from "flexlayout-react";
import "flexlayout-react/style/dark.css"; // 或者使用 light.css
import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Link } from "react-router-dom";
import { links } from "./root.helper.js";

export default function Root(props) {
  const [loadedApps, setLoadedApps] = useState({
    people: false,
    planets: false,
  });

  // 创建布局模型
  const layoutRef = useRef(null);
  const [layoutModel, setLayoutModel] = useState(null);

  // 初始化布局模型
  useEffect(() => {
    // 定义初始布局配置
    const json = {
      global: {
        splitterSize: 5,
        tabEnableFloat: false,
      },
      borders: [],
      layout: {
        type: "row",
        weight: 100,
        children: [
          {
            type: "tabset",
            weight: 50,
            id: "left-container",
            children: [
              {
                type: "tab",
                name: "People",
                id: "people-tab",
                component: "people-component",
              },
            ],
          },
          {
            type: "tabset",
            weight: 50,
            id: "right-container",
            children: [
              {
                type: "tab",
                name: "Planets",
                id: "planets-tab",
                component: "planets-component",
              },
            ],
          },
        ],
      },
    };

    // 创建布局模型
    const model = Model.fromJson(json);
    setLayoutModel(model);
  }, []);

  // 自定义组件工厂
  const factory = (node) => {
    const component = node.getComponent();

    if (component === "people-component") {
      return (
        <div style={{ width: "100%", height: "100%" }}>
          <div
            id="single-spa-application:@react-mf/people"
            style={{ width: "100%", height: "100%" }}
          ></div>
        </div>
      );
    } else if (component === "planets-component") {
      return (
        <div style={{ width: "100%", height: "100%" }}>
          <div
            id="single-spa-application:@react-mf/planets"
            style={{ width: "100%", height: "100%" }}
          ></div>
        </div>
      );
    }

    return <div>未知组件</div>;
  };

  const loadApp = (appName) => {
    // 避免重复加载
    if (loadedApps[appName]) return;

    const appNameWithPrefix = `@react-mf/${appName}`;

    // 使用全局方法激活应用
    if (window.activateApp) {
      window.activateApp(appNameWithPrefix);

      // 标记应用已加载
      setLoadedApps((prev) => ({
        ...prev,
        [appName]: true,
      }));
    } else {
      console.error("activateApp 方法未定义，请确保 root-config 已正确加载");
    }
  };

  return (
    <BrowserRouter>
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <div className="h-16 flex items-center justify-between px-6 bg-primary text-white">
          <div className="flex items-center justify-between">
            {links.map((link) => {
              return (
                <Link
                  key={link.href}
                  className="p-6"
                  to={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, "", link.href);
                    if (link.href.includes("people")) {
                      loadApp("people");
                    } else if (link.href.includes("planets")) {
                      loadApp("planets");
                    }
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center justify-between">
            <a
              href="https://github.com/react-microfrontends"
              className="externalLink"
            >
              Github project
            </a>
          </div>
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          {layoutModel && (
            <Layout ref={layoutRef} model={layoutModel} factory={factory} />
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}
