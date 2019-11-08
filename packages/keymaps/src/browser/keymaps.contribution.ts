import { Autowired, Injectable } from '@ali/common-di';
import {
  ClientAppContribution,
  URI,
  Domain,
  CommandContribution,
  CommandRegistry,
  COMMON_COMMANDS,
  KeybindingContribution,
  KeybindingRegistry,
  WithEventBus,
  MaybePromise,
  localize,
  MenuContribution,
  MenuModelRegistry,
  EDITOR_COMMANDS,
  CommandService,
  SETTINGS_MENU_PATH,
} from '@ali/ide-core-browser';
import { IFileServiceClient } from '@ali/ide-file-service/lib/common';
import { BrowserEditorContribution, EditorComponentRegistry } from '@ali/ide-editor/lib/browser';
import { ResourceService, IResourceProvider, IResource } from '@ali/ide-editor';
import { KEYMAPS_SCHEME, IKeymapService } from '../common';
import { KeymapsView } from './keymaps.view';
import { getIcon } from '@ali/ide-core-browser/lib/icon';
import { NextMenuContribution, IMenuRegistry } from '@ali/ide-core-browser/lib/menu/next';

const KEYMAPS_PREVIEW_COMPONENT_ID = 'keymaps-preview';

@Injectable()
export class KeymapsResourceProvider extends WithEventBus implements IResourceProvider {

  readonly scheme: string = KEYMAPS_SCHEME;

  constructor() {
    super();
  }

  provideResource(uri: URI): MaybePromise<IResource<any>> {
    return {
      name: localize('keymaps.tab.name'),
      icon: getIcon('setting'),
      uri,
    };
  }

  provideResourceSubname(resource: IResource, groupResources: IResource[]): string | null {
    return null;
  }

  async shouldCloseResource(resource: IResource, openedResources: IResource[][]): Promise<boolean> {
    return true;
  }
}

export namespace KeymapsContextMenu {
  // 1_, 2_用于菜单排序，这样能保证分组顺序顺序
  export const KEYMAPS = '2_keymaps';
}

@Domain(CommandContribution, KeybindingContribution, ClientAppContribution, BrowserEditorContribution, NextMenuContribution)
export class KeymapsContribution implements CommandContribution, KeybindingContribution, ClientAppContribution, BrowserEditorContribution, NextMenuContribution {

  @Autowired(IFileServiceClient)
  protected readonly filesystem: IFileServiceClient;

  @Autowired(KeymapsResourceProvider)
  protected readonly keymapsResourceProvider: KeymapsResourceProvider;

  @Autowired(IKeymapService)
  protected readonly keymapService: IKeymapService;

  registerCommands(commands: CommandRegistry) {
    commands.registerCommand(COMMON_COMMANDS.OPEN_KEYMAPS, {
      isEnabled: () => true,
      execute: async () => {
        await this.keymapService.open();
      },
    });
  }

  registerNextMenus(menus: IMenuRegistry) {
    menus.registerMenuItem(SETTINGS_MENU_PATH, {
      command: {
        id: COMMON_COMMANDS.OPEN_KEYMAPS.id,
      },
      group: KeymapsContextMenu.KEYMAPS,
    });
  }

  registerKeybindings(keybindings: KeybindingRegistry): void {
    keybindings.registerKeybinding({
      command: COMMON_COMMANDS.OPEN_KEYMAPS.id,
      keybinding: 'ctrlcmd+K ctrlcmd+S',
    });
  }

  onStart() {

  }

  initialize(): void {
  }

  registerResource(resourceService: ResourceService) {
    resourceService.registerResourceProvider(this.keymapsResourceProvider);
  }

  registerEditorComponent(editorComponentRegistry: EditorComponentRegistry) {

    editorComponentRegistry.registerEditorComponent({
      component: KeymapsView,
      uid: KEYMAPS_PREVIEW_COMPONENT_ID,
      scheme: KEYMAPS_SCHEME,
    });

    editorComponentRegistry.registerEditorComponentResolver(KEYMAPS_SCHEME, (_, __, resolve) => {

      resolve!([
        {
          type: 'component',
          componentId: KEYMAPS_PREVIEW_COMPONENT_ID,
        },
      ]);

    });
  }
}
