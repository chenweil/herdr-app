import { View, div } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { closeOverlay, props, theme, exec } from "herdr";

const STORE = "along.machines.disabled";

function saved() {
  try { return JSON.parse(localStorage.getItem(STORE) ?? "{}"); }
  catch { return {}; }
}

function save(value) {
  localStorage.setItem(STORE, JSON.stringify(value));
}

function addArgs(machine) {
  const args = ["machine", "add", "--json", "--name", machine.name];
  if (machine.session) args.push("--session", machine.session);
  if (machine.temporary) args.push("--temp");
  if (machine.via) args.push("--via", machine.target);
  else args.push(machine.target);
  return args;
}

export default class AlongMachines extends View {
  init(_props, cx) {
    this.at = 0;
    this.busy = new Set();
    this.machines = [];
    this.error = null;
    this.handle = cx.focus_handle();
    this.handle.focus();
    this.refresh(cx);
  }

  async list() {
    const result = await exec("hc", ["machine", "ls", "--json"]);
    if (result.code !== 0) throw new Error((result.stderr || result.stdout).trim() || "Cannot list machines");
    const current = JSON.parse(result.stdout).machines ?? [];
    const disabled = saved();
    const names = new Set(current.map((machine) => machine.name));
    return [...current.map((machine) => ({ ...machine, enabled: true })),
      ...Object.values(disabled).filter((machine) => !names.has(machine.name)).map((machine) => ({ ...machine, enabled: false, state: "disabled" }))];
  }

  refresh(cx) {
    cx.spawn(async cx => {
      try { this.machines = await this.list(); this.error = null; }
      catch (e) { this.error = String(e); }
      cx.notify();
    });
  }

  async toggle(machine) {
    if (this.busy.has(machine.name)) return;
    this.busy.add(machine.name); this.error = null;
    const disabled = saved();
    try {
      if (machine.enabled) {
        disabled[machine.name] = machine;
        save(disabled);
        const result = await exec("hc", ["machine", "rm", "--json", machine.name]);
        if (result.code !== 0) {
          delete disabled[machine.name]; save(disabled);
          throw new Error((result.stderr || result.stdout).trim() || `Cannot disable ${machine.name}`);
        }
      } else {
        const result = await exec("hc", addArgs(machine));
        if (result.code !== 0) throw new Error((result.stderr || result.stdout).trim() || `Cannot enable ${machine.name}`);
        delete disabled[machine.name]; save(disabled);
      }
      this.machines = await this.list();
    } catch (e) { this.error = String(e); }
    finally { this.busy.delete(machine.name); }
  }

  render(cx) {
    const t = theme(), list = this.machines;
    return v_flex()
      .id("along-machines")
      .track_focus(this.handle)
      .w_full()
      .min_h(0)
      .p(12)
      .gap(8)
      .bg(t.popover)
      .text_color(t.foreground)
      .text_size(13)
      .on_key_down((e, cx) => {
        if (e.key === "escape") closeOverlay(props()?.overlay);
        else if (e.key === "down" && list.length) this.at = (this.at + 1) % list.length;
        else if (e.key === "up" && list.length) this.at = (this.at + list.length - 1) % list.length;
        else if (e.key === "enter" && list[this.at]) this.toggle(list[this.at]);
        else return;
        cx.notify();
      })
      .child(h_flex().items_center().gap(8)
        .child(div().font_semibold().flex_1().child("Machines"))
        .child(div().text_color(t.dim).text_size(11).child("enable / disable")))
      .child(v_flex().gap(4).children(list.map((machine, i) => {
        const busy = this.busy.has(machine.name);
        return h_flex().id(`along-machine-${machine.name}`).h(36).flex_none().px(9).gap(8).items_center().rounded(7)
          .when(i === this.at, el => el.bg(t.selected)).hover(s => s.bg(t.hover))
          .child(div().w(7).h(7).rounded(4).flex_none().bg(machine.enabled ? t.ansi2 : t.dim))
          .child(v_flex().flex_1().min_w(0)
            .child(div().truncate().child(machine.name))
            .child(div().text_size(11).text_color(t.dim).truncate().child(machine.enabled ? (machine.state ?? "registered") : "disabled")))
          .child(div().px(8).py(4).rounded(5).text_size(11).text_color(machine.enabled ? t.ansi1 : t.ansi2)
            .when(!busy, el => el.cursor_pointer())
            .on_click(() => this.toggle(machine))
            .child(busy ? "Working…" : machine.enabled ? "Disable" : "Enable"));
      })))
      .when(!list.length && !this.error, el => el.child(div().p(8).text_color(t.dim).child("No saved machines")))
      .when(Boolean(this.error), el => el.child(div().text_size(11).text_color(t.ansi1).child(this.error)));
  }
}
