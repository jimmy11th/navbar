import { Actions, DockLocation, Layout, Model } from "flexlayout-react";
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
    // 定义初始布局配置，只有一个欢迎标签页
    const json = {
      global: {
        splitterSize: 5,
        tabEnableFloat: false,
        tabEnableClose: true,
      },
      borders: [],
      layout: {
        type: "row",
        weight: 100,
        children: [
          {
            type: "tabset",
            weight: 100,
            id: "main-tabset",
            children: [
              {
                type: "tab",
                name: "欢迎",
                id: "welcome-tab",
                component: "welcome-component",
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

    if (component === "welcome-component") {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>欢迎使用微前端应用</h2>
          <p>请点击顶部导航按钮加载应用</p>
        </div>
      );
    } else if (component === "people-component") {
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

  // 转换到左右两列布局
  const convertToSplitLayout = () => {
    if (!layoutModel) return;

    // 检查欢迎标签页是否存在
    const welcomeTab = layoutModel.getNodeById("welcome-tab");
    if (welcomeTab) {
      // 先删除欢迎标签页
      layoutModel.doAction(Actions.deleteTab("welcome-tab"));
    }

    // 检查是否已经存在分割布局
    const leftContainer = layoutModel.getNodeById("left-container");
    const rightContainer = layoutModel.getNodeById("right-container");

    if (!leftContainer && !rightContainer) {
      // 清空主布局
      const rootNode = layoutModel.getRoot();
      const mainTabset = layoutModel.getNodeById("main-tabset");
      if (mainTabset) {
        // 删除主标签集
        layoutModel.doAction(Actions.deleteTabset("main-tabset"));
      }

      // 创建左右两列布局
      const rowNode = {
        type: "row",
        weight: 100,
        children: [
          {
            type: "tabset",
            weight: 50,
            id: "left-container",
            children: [],
          },
          {
            type: "tabset",
            weight: 50,
            id: "right-container",
            children: [],
          },
        ],
      };

      // 添加到根节点
      layoutModel.doAction(
        Actions.addNode(
          rowNode,
          layoutModel.getRoot().getId(),
          DockLocation.CENTER,
          -1,
          true
        )
      );
    }
  };

  // 加载应用并创建标签页
  const loadApp = (appName) => {
    if (!layoutModel) return;

    // 先确保转换到左右两列布局
    convertToSplitLayout();

    const appNameWithPrefix = `@react-mf/${appName}`;
    const tabsetId =
      appName === "people" ? "left-container" : "right-container";
    const componentName = `${appName}-component`;
    const tabId = `${appName}-tab`;

    // 检查是否已经存在该应用的标签页
    const existingTab = layoutModel.getNodeById(tabId);
    if (!existingTab) {
      // 如果不存在，创建新标签页
      const tabJson = {
        type: "tab",
        name: appName.charAt(0).toUpperCase() + appName.slice(1),
        id: tabId,
        component: componentName,
      };

      // 添加到对应的标签集
      layoutModel.doAction(
        Actions.addNode(tabJson, tabsetId, DockLocation.CENTER, -1, true)
      );
    }

    // 激活标签页
    layoutModel.doAction(Actions.selectTab(tabId));

    // 激活应用
    if (!loadedApps[appName] && window.activateApp) {
      window.activateApp(appNameWithPrefix);

      // 标记应用已加载
      setLoadedApps((prev) => ({
        ...prev,
        [appName]: true,
      }));
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
