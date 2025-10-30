import { FluentDesignSystem, DialogBodyDefinition, ButtonDefinition, DialogDefinition, TextDefinition, LabelDefinition, DropdownDefinition, DropdownOptionDefinition, ListboxDefinition, setTheme } from '@fluentui/web-components';
import { webDarkTheme } from "@fluentui/tokens";


setTheme(webDarkTheme)

for (const d of [
  DialogBodyDefinition,
  ButtonDefinition,
  DialogDefinition,
  TextDefinition,
  LabelDefinition,
  DropdownDefinition,
  DropdownOptionDefinition,
  ListboxDefinition
]) {
  d.define(FluentDesignSystem.registry)
}

