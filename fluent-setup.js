import { FluentDesignSystem, DialogBodyDefinition, ButtonDefinition, DialogDefinition, TextDefinition, LabelDefinition, setTheme } from '@fluentui/web-components';
import { webDarkTheme } from "@fluentui/tokens";


setTheme(webDarkTheme)

DialogBodyDefinition.define(FluentDesignSystem.registry);
ButtonDefinition.define(FluentDesignSystem.registry);
DialogDefinition.define(FluentDesignSystem.registry);
TextDefinition.define(FluentDesignSystem.registry);
LabelDefinition.define(FluentDesignSystem.registry);

