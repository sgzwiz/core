import { Autowired, Injectable } from '@ali/common-di';
import { IEditorDocumentModelContentProvider } from '@ali/ide-editor/lib/browser';
import { URI } from '@ali/ide-core-common';

import { AbstractSCMDocContentProvider } from './base-scm';

import { ICodeService } from '../../../services/code-service/base';
import { fromSCMUri } from '../../../utils/scm-uri';

@Injectable()
export class GitDocContentProvider extends AbstractSCMDocContentProvider implements IEditorDocumentModelContentProvider {
  // TODO: 需要增加对文件变更后的监听，以保持文件内容最新
  scheme = 'git';

  @Autowired(ICodeService)
  private readonly codeService: ICodeService;

  fetchContentFromSCM(uri: URI) {
    const info = fromSCMUri(uri);
    return this.codeService.fetchContent(info.repo, info.path, info.ref);
  }
}