import chalk from 'chalk';
import { spawn } from 'child_process';
import { EnviromentType } from '../constants';

export type ExcuteOptions = {
    cmd: string;
};

/**
 * 获取环境变量
 *
 * @export
 * @param {string} name
 * @param {string} [value]
 * @return {*}
 */
export function env(name: string, value?: string) {
    if (value) process.env[name] = value;
    return process.env[name];
}

/**
 * 执行App内部命令
 *
 * @export
 * @param {ExcuteOptions} { cmd = '-h' }
 */
export async function excuteHandler({ cmd = '-h' }: ExcuteOptions) {
    env('NODE_ENV', EnviromentType.DEV);
    if (cmd === 'start') {
        console.log();
        console.log(chalk.red(`\n❌ please use nest-cli to start app direct`));
        process.exit(1);
    }
    let pms = [
        '--files',
        '-T',
        `-P`,
        'tsconfig.build.json',
        '-r',
        'tsconfig-paths/register',
        './src/main.ts',
    ];
    pms = cmd ? [...pms, ...cmd.split(' ')] : [...pms, '-h'];
    const ls = spawn('ts-node', pms, {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: process.env,
    });
    ls.on('close', (code) => process.exit(code ?? undefined));
}
