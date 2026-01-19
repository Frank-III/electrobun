import { For } from "solid-js";
import type { ConnectionProfile } from "../types";
import type { ColorModeSetting } from "../theme";

type TitleBarProps = {
  title: string;
  subtitle: string;
  profiles: ConnectionProfile[];
  activeProfileId: string | null;
  onProfileSelect: (value: string) => void;
  onOpenConnections: (action?: "new") => void | Promise<void>;
  onOpenDevtools: () => void | Promise<void>;
  onOpenWindow: () => void | Promise<void>;
  onOpenPalette: () => void;
  themeName: string;
  themeNames: string[];
  onThemeNameChange: (next: string) => void;
  themeMode: ColorModeSetting;
  onThemeModeChange: (next: ColorModeSetting) => void;
  onConnect: () => void | Promise<void>;
  isConnecting: boolean;
  hasActiveProfile: boolean;
};

export default function TitleBar(props: TitleBarProps) {
  return (
    <div class="titlebar electrobun-webkit-app-region-drag">
      <div class="brand">
        <div class="brand-title">{props.title}</div>
        <div class="brand-subtitle">{props.subtitle}</div>
      </div>

      <div class="toolbar">
        <button class="btn btn-secondary" onClick={() => void props.onOpenConnections()}>
          Connections
        </button>

        <select
          class="select"
          value={props.activeProfileId ?? ""}
          disabled={props.profiles.length === 0}
          onChange={(e) => props.onProfileSelect(e.currentTarget.value)}
          title="Active connection profile"
        >
          <For each={props.profiles}>
            {(profile) => <option value={profile.id}>{profile.name}</option>}
          </For>
          <option value="__manage__">Manage…</option>
          <option value="__new__">New connection…</option>
        </select>

        <button
          class="btn btn-ghost"
          onClick={() => void props.onOpenWindow()}
          disabled={!props.hasActiveProfile}
          title="Open this connection in a new window"
        >
          New window
        </button>

        <button class="btn btn-secondary" onClick={props.onOpenPalette} title="Cmd/Ctrl+K">
          Commands <span class="kbd">⌘K</span>
        </button>

        <button class="btn btn-ghost" onClick={() => void props.onOpenDevtools()} title="Open devtools window">
          Devtools
        </button>

        <select
          class="select"
          value={props.themeName}
          onChange={(e) => props.onThemeNameChange(e.currentTarget.value)}
          title="Theme"
        >
          <For each={props.themeNames}>{(name) => <option value={name}>{name}</option>}</For>
        </select>

        <select
          class="select"
          value={props.themeMode}
          onChange={(e) => props.onThemeModeChange(e.currentTarget.value as ColorModeSetting)}
          title="Color mode"
        >
          <option value="system">System</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>

        <button class="btn btn-primary" onClick={() => void props.onConnect()} disabled={props.isConnecting}>
          {props.isConnecting ? "Connecting…" : "Connect"}
        </button>
      </div>
    </div>
  );
}
