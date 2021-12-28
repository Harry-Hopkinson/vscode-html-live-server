'use strict';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './Config';

export const SUPPRORTED_EXT: string[] = [
    '.html', '.htm', '.svg'
];

export const isRelativePath = (pathUrl: string) => {
    if (pathUrl.startsWith('*')) return false;

    return !path.isAbsolute(pathUrl);
};

export class Helper {

    public static testPathWithRoot(workSpacePath: string) {

        let rootPath: string;

        const testPath = path.join(workSpacePath, Config.getRoot);

        let isNotOkay = !fs.existsSync(testPath);
        if (!isNotOkay) {
            rootPath = testPath;
        }
        else {
            rootPath = workSpacePath;
        }

        if (!rootPath.endsWith(path.sep))
            rootPath = rootPath + path.sep;

        return {
            isNotOkay,
            rootPath
        };
    }
    public static getSubPath(rootPath: string, targetPath: string) {

        if (!Helper.IsSupportedFile(targetPath) || !targetPath.startsWith(rootPath)) {
            return null;
        }

        return targetPath.substring(rootPath.length, targetPath.length);
    }
    public static IsSupportedFile(file: string): boolean {
        let ext = path.extname(file) || (file.startsWith('.') ? file : `.${file}`);
        return SUPPRORTED_EXT.indexOf(ext.toLowerCase()) > -1;
    }
    public static generateParams(
        rootPath: string,
        workspacePath: string,
        onTagMissedCallback?: MethodDecorator
    ) {

        workspacePath = workspacePath || '';
        const port = Config.getPort;
        const ignorePathGlob = Config.getIgnoreFiles || [];

        const ignoreFiles = [];
        ignorePathGlob.forEach(ignoredPath => {
            if (isRelativePath(ignoredPath))
                ignoreFiles.push(path.join(workspacePath, ignoredPath));
            else ignoreFiles.push(ignoredPath);
        });

        const proxy = Helper.getProxySetup();
        const https = Helper.getHttpsSetup();

        const mount = Config.getMount;
        mount.forEach((mountRule: Array<any>) => {
            if (mountRule.length === 2 && mountRule[1]) {
                mountRule[1] = path.resolve(workspacePath, mountRule[1]);
            }
        });

        const file = Config.getFile;
        return {
            port: port,
            host: '0.0.0.0',
            root: rootPath,
            file: file,
            open: false,
            https: https,
            ignore: ignoreFiles,
            disableGlobbing: true,
            proxy: proxy,
            cors: true,
            wait: Config.getWait || 100,
            fullReload: Config.getfullReload,
            useBrowserExtension: Config.getUseWebExt,
            onTagMissedCallback: onTagMissedCallback,
            mount: mount
        };
    }

    static getHttpsSetup() {
        const httpsConfig = Config.getHttps;
        let https = null;
        if (httpsConfig.enable === true) {
            let cert = fs.readFileSync(httpsConfig.cert, 'utf8');
            let key = fs.readFileSync(httpsConfig.key, 'utf8');
            https = {
                cert: cert,
                key: key,
                passphrase: httpsConfig.passphrase
            };
        }

        return https;
    }

    static getProxySetup() {
        const proxySetup = Config.getProxy;
        let proxy = [[]];
        if (proxySetup.enable === true) {
            proxy[0].push(proxySetup.baseUri, proxySetup.proxyUri);
        }
        else {
            proxy = null; 
        }

        return proxy;
    }
}