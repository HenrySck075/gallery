import { FluentDesignSystem, setTheme } from '@fluentui/web-components';
import { webDarkTheme } from "@fluentui/tokens";
// Component imports
import { CardDefinition } from '@fluentui/web-components/card.js';
import { ButtonDefinition } from '@fluentui/web-components/button.js';
import { DialogDefinition } from '@fluentui/web-components/dialog.js';
import { TextDefinition } from '@fluentui/web-components/text.js';
import { HeadingDefinition } from '@fluentui/web-components/heading.js';


setTheme(webDarkTheme)

CardDefinition.define(FluentDesignSystem.registry);
ButtonDefinition.define(FluentDesignSystem.registry);
DialogDefinition.define(FluentDesignSystem.registry);
TextDefinition.define(FluentDesignSystem.registry);
HeadingDefinition.define(FluentDesignSystem.registry);
