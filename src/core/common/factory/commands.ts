import chalk from 'chalk';
import yargs, { CommandModule } from 'yargs';
import { AppParams, CommandItem, CreateOptions } from '../types';

/**
 * 利用Yargs构建命令
 *
 * @export
 * @param {Required<AppParams>} params
 * @param {CreateOptions['hooks']} hooks
 */
export function buildCommands(commands: CommandModule<any, any>[]) {
    console.log();
    commands.forEach((command) => yargs.command(command));
    yargs
        .usage('Usage: $0 <command> [options]')
        .scriptName('cli')
        .demandCommand(1, '')
        .fail((msg, err, y) => {
            if (!msg && !err) {
                yargs.showHelp();
                process.exit();
            }
            if (msg) console.error(chalk.red(msg));
            if (err) console.error(chalk.red(err.message));
            process.exit();
        })
        .strict()
        .alias('v', 'version')
        .help('h')
        .alias('h', 'help').argv;
}

/**
 * 生成自定义命令
 *
 * @export
 * @param {Required<AppParams>} params
 * @param {CreateOptions['hooks']} hooks
 * @param {boolean} [echo]
 * @return {*}  {CommandModule<any, any>[]}
 */
export function getCommands(
    params: Required<AppParams>,
    hooks: CreateOptions['hooks'],
    echo?: boolean,
): CommandModule<any, any>[] {
    const { current, utiler, plugins } = params;
    const UtilCommands: Array<CommandItem<any, any>> = utiler
        .all()
        .map(({ value }) => value.commands())
        .reduce((o, n) => [...o, ...n], []);
    const pluginCommands: Array<
        CommandItem<any, any>
    > = plugins
        .map(({ meta }) => (meta.commands ? meta.commands() : []))
        .reduce((o, n) => [...o, ...n], []);
    const commands = [...UtilCommands, ...pluginCommands].map((item) => {
        const command = item(params, hooks);
        return {
            ...command,
            handler: async (args: yargs.Arguments<any>) => {
                const handler = command.handler as (
                    ...argvs: yargs.Arguments<any>
                ) => Promise<void>;
                await handler({ ...params, ...args });
                await current.close();
                if (hooks?.closed) await hooks.closed(params);
                await Promise.all(
                    utiler
                        .all()
                        .map(async ({ value }) => value.onClosed(params)),
                );

                await Promise.all(
                    plugins.map(
                        async ({ meta }) =>
                            meta.hooks?.closed && meta.hooks.closed(params),
                    ),
                );
            },
        };
    });
    commands.push(getRunCommand(params, hooks, echo));
    return commands;
}

/**
 * 监听HTTP命令
 *
 * @param {Required<AppParams>} params
 * @param {CreateOptions['hooks']} hooks
 * @param {boolean} [echo]
 * @return {*}
 */
function getRunCommand(
    params: Required<AppParams>,
    hooks: CreateOptions['hooks'],
    echo?: boolean,
) {
    const { configure, current, utiler, plugins } = params;
    return {
        command: ['start', '$0'],
        describe: 'Start app',
        builder: {},
        handler: async () => {
            const host = configure.get<boolean>('app.host');
            const port = configure.get<number>('app.port')!;
            const https = configure.get<boolean>('app.https');
            let appUrl = configure.get<string>('app.url');
            if (!appUrl) {
                appUrl = `${https ? 'https' : 'http'}://${host!}:${port}`;
            }
            await current.listen(port, '0.0.0.0', async () => {
                console.log();
                console.log('Server has started:');
                if (hooks?.started) await hooks.started(params);
                for (const { value } of utiler.all()) {
                    await value.onStarted(params);
                }
                for (const { meta } of plugins) {
                    if (meta.hooks?.started) {
                        await meta.hooks.started(params);
                    }
                }
                if ((typeof echo === 'boolean' && echo) || echo === undefined) {
                    console.log(`- API: ${chalk.green.underline(appUrl!)}`);
                }
            });
        },
    };
}
