
import ShellClientResource from './client-resource.js';
import { runCommand } from 'lively.ide/shell/shell-interface.js';

export default class GitShellResource extends ShellClientResource {
  constructor (url, l2lClient, options = {}) {
    url = url.replace('git\/', '');
    super(url);
    this.options.cwd = this.url;
  }

  runCommand (cmd) {
    return runCommand(cmd, this.options);
  }

  async isGitRepository (withRemote = false) {
    const isDir = await this.isDirectory();
    if (!isDir) return false;

    let cmd = this.runCommand('test -d ".git"');
    await cmd.whenDone();
    if (!withRemote) return cmd.exitCode === 0;
    cmd = this.runCommand('git remote');
    await cmd.whenDone();
    return cmd.exitCode === 0 && cmd.stdout !== '';
  }

  async initializeGitRepository () {
    const cmd = this.runCommand('git init -b main');
    await cmd.whenDone();
  }

  async addRemoteToGitRepository (token, repoName, repoUser, repoDescription, orgScope = false) {
    let repoCreationCommand = orgScope
      ? `curl -L \
              -X POST \
              -H "Accept: application/vnd.github+json" \
              -H "Authorization: Bearer ${token}"\
              -H "X-GitHub-Api-Version: 2022-11-28" \
              https://api.github.com/orgs/${repoUser}/repos \
              -d '{"name":"${repoName}","description":"${repoDescription}"}'`
      : `curl -L \
              -X POST \
              -H "Accept: application/vnd.github+json" \
              -H "Authorization: Bearer ${token}" \
              https://api.github.com/user/repos \
              -d '{"name":"${repoName}", "description": "${repoDescription}"}'`;
    let cmd = this.runCommand(repoCreationCommand);
    await cmd.whenDone();
    const addingRemoteCommand = `git remote add origin https://${token}@github.com/${repoUser}/${repoName}.git`;
    await this.runCommand(addingRemoteCommand).whenDone();
    // TODO: We could improve by providing a way to configure this.
    const trackingCommand = 'git branch --track origin';
    await this.runCommand(trackingCommand).whenDone();
  }

  // TODO: throw errors
  async commitRepo (message) {
    let cmdString = `git add . && git commit -m "${message}"`;
    let cmd = this.runCommand(cmdString);
    await cmd.whenDone();
  }

  async pushRepo () {
    await this.pullRepo();
    await this.commitRepo();
    const cmd = this.runCommand('git push --set-upstream origin main');
    await cmd.whenDone();
  }

  // TODO: functioning error handling, especially in the case of conflicts
  async pullRepo () {
    await this.runCommand('git stash').whenDone();
    const pullCmd = this.runCommand('git pull');
    await pullCmd.whenDone();
    const cmd = this.runCommand('git stash pop');
    await cmd.whenDone();
  }
}

let _defaultL2LClient;

export const gitResourceExtension = {
  name: 'git-shell-client',
  matches: (url) => url.startsWith('git/') || url.match(/[a-z]:\\/i), // abs path
  resourceClass: GitShellResource
};