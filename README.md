# opencode2-wakatime

WakaTime 插件，面向 [OpenCode 2](https://opencode.ai/v2/docs/)。统计 AI 编码活动、改动行数和耗时。

OpenCode 1 请继续使用 [`opencode-wakatime`](https://www.npmjs.com/package/opencode-wakatime)。OpenCode 2 不会运行 1.x 插件函数。

## 功能

- 自动下载和更新 wakatime-cli
- 跟踪 `read` / `edit` / `write` / `patch` / `multiedit`，以及 OpenCode 2 的 `apply_patch`、`str_replace` 等别名
- 上报 `--ai-line-changes`
- 每个项目每分钟最多一次心跳
- 会话 idle / deleted 时刷出最后一批心跳

## 前置条件

在 `~/.wakatime.cfg`（或 `$WAKATIME_HOME/.wakatime.cfg`）里配置 API key：

```ini
[settings]
api_key = waka_your_api_key_here
```

API key 从 [WakaTime Settings](https://wakatime.com/api-key) 获取。插件找不到 wakatime-cli 时会自动下载；也可以自己安装：

```bash
brew install wakatime-cli
```

## 安装

推荐用 OpenCode 自己安装包插件：

```bash
opencode plugin add opencode2-wakatime
```

或写进 `opencode.jsonc`：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["opencode2-wakatime"]
}
```

也可以全局安装后拷到 OpenCode 2 的插件目录：

```bash
npm i -g opencode2-wakatime
opencode2-wakatime --install
```

这会安装到 `~/.config/opencode/plugins/opencode2-wakatime.js`。如果还留着 OpenCode 1 的 `~/.config/opencode/plugin/wakatime.js`，`--install` 会把它删掉，避免两份插件同时心跳。

## 工作方式

OpenCode 2 的插件入口是 `{ id, setup(ctx) }`，不再返回 V1 的 hook 对象。

| OpenCode 1 | OpenCode 2 |
| --- | --- |
| `event` 里的 `message.part.updated` | `ctx.tool.hook("execute.after")`，事件流作为兜底 |
| `chat.message` | `ctx.session.hook("prompt")` |
| `session.idle` / `session.deleted` | `ctx.event.subscribe()` |
| `client` + `/global/health` | `ctx.app.version` |
| `worktree` / `project.worktree` | `ctx.session.get()` 的目录，否则 `ctx.location` |

插件标识：`opencode-<client>/<version> opencode2-wakatime/<version>`。

## 文件

默认写在 `~/.wakatime/`。设置了 `WAKATIME_HOME` 时改到那个目录。

| 文件 | 用途 |
| --- | --- |
| `opencode.log` | `debug=true` 时的日志 |
| `opencode-{hash}.json` | 每个项目的上次心跳时间 |
| `opencode-cli-state.json` | CLI 版本 |
| `wakatime-cli-*` | 自动下载的 CLI |

## 开发

```bash
npm install
npm run typecheck
npm test
npm run build
```

## 排错

心跳没发出去时，先确认 `~/.wakatime.cfg` 里有 API key，再跑 `wakatime-cli --version`。把配置里的 `debug` 设成 `true` 后看 `~/.wakatime/opencode.log`。

插件没加载时，确认配置字段是 `plugins` 而不是 OpenCode 1 的 `plugin`，然后执行 `opencode plugin list`。

## License

MIT
