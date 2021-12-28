import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

suite('Extension Tests', () => {

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('ritwickdey.LiveServer'));
    });

    test('should activate', function () {
        this.timeout(1 * 60 * 1000);
        return vscode.extensions.getExtension('ritwickdey.LiveServer').activate()
            .then((api) => {
                assert.ok(true);
            });
    });

    test('should register all live server commands', function () {
        return vscode.commands.getCommands(true).then((commands) => {
            const COMMANDS = [
                'extension.liveServer.goOnline',
                'extension.liveServer.goOffline',
                'extension.liveServer.changeWorkspace'
            ];
            const foundLiveServerCommands = commands.filter((value) => {
                return COMMANDS.indexOf(value) >= 0 || value.startsWith('extension.liveServer.');
            });
            assert.equal(foundLiveServerCommands.length, COMMANDS.length);
        });
    });


});