# Free Games Claimer

この私のフォークではブランチ元のイシューをすべて解消するのを目的としている。
～～～～
Windows、macOS、Linuxで動作します。

Raspberry Pi (3、4、Zero 2): Raspberry Pi OSやUbuntuのような64ビットOSが必要です（Raspbianは32ビットなので動作しません）。

実行方法
簡単な方法：Docker（またはPodman）をインストールして、ターミナルで以下のコマンドを実行してください。

docker run --rm -it -p 6080:6080 -v fgc:/fgc/data --pull=always ghcr.io/vogler/free-games-claimer
現在、これによりEpic GamesのCAPTCHA認証が求められます。問題#183が修正されるまでは、Dockerを使用せずに実行することをお勧めしますnode epic-games（下記参照）。

これは実行されますnode epic-games; node prime-gaming; node gog。1 つのストアのゲームのみを請求したい場合は、コマンドnode epic-gamesの最後になどを追加することでデフォルトのコマンドを上書きできます。docker run複数のストアのゲームを請求したい場合は、 などを追加してくださいbash -c "node epic-games.js; node gog.js"。データ (請求したゲーム、引き換えコード、スクリーンショットを含む json ファイルなど) は、Docker ボリュームに保存されますfgc。

Dockerを使わずに実行したい、あるいはローカル環境で開発したい。
使用法
すべてのスクリプトは、ブラウザのGUIを表示するか非表示にする（ヘッドレスモード）かのいずれかを選択して、自動的にFirefoxインスタンスを起動します。デフォルトでは、ホストシステム上でブラウザが開いている状態は表示されません。

Dockerコンテナ内で実行する場合、ブラウザはコンテナ内部でのみ表示されます。コンテナ内で実行されているブラウザを操作するには、noVNC経由でhttp://localhost:6080にアクセスするか、ポート5900で他のVNCクライアントを使用してください。
Docker の外部でスクリプトを実行する場合、デフォルトではブラウザは非表示になります。UISHOW=1 ...を表示するには、以下のオプションを参照してください。
初回実行時は、ゲームを入手したい各ストアにログインする必要があります。ターミナル経由で間接的にログインすることも、ブラウザで直接ログインすることもできます。スクリプトは、ログインが完了するまで待機します。

2FA/MFA（二要素認証/多要素認証）が有効になっている場合、端末にメールアドレス、パスワード、そしてワンタイムパスワード/セキュリティコード（OTP）の入力を求めるプロンプトが表示されます。ブラウザ経由でログインする場合は、端末でEscキーを押してプロンプトをスキップできます。

ログイン後、スクリプトは引き続き現在プレイ中のゲームを登録します。ログイン後もスクリプトが待機状態のままの場合は、スクリプトを再起動してください（そして、問題を報告してください）。スクリプトを定期的に実行していれば、再度ログインする必要はありません。

設定／オプション
オプションは環境変数によって設定され、柔軟な構成が可能になります。

初回実行時には、スクリプトが設定手順を案内し、すべての設定をファイルに保存しますdata/config.env。このファイルを直接編集することも、コマンドを実行してnode fgc config設定アシスタントを再度実行することもできます。

利用可能なオプション／変数とそのデフォルト値：

オプション | デフォルト | 説明
--- | --- | ---
SHOW | 1 | 1 の場合、ブラウザを表示します。Docker のデフォルト設定で、外部で実行している場合は表示されません。
WIDTH | 1280 | 開いているブラウザの幅（およびDocker内のVNCの場合は画面の幅）。
HEIGHT | 1280 | 開いているブラウザの高さ（およびDocker内のVNCの場合は画面の高さ）。
VNC_PASSWORD | | Docker用のVNCパスワード。デフォルトではパスワードは使用されていません！
NOTIFY | | 使用する通知サービス（Pushover、Slack、Telegramなど）については、以下を参照してください。
NOTIFY_TITLE | | 通知のオプションのタイトル。例：Pushover。
BROWSER_DIR | data/browser | ブラウザプロファイル用のディレクトリ（複数アカウント用など）。
TIMEOUT | 60 | ページ操作のタイムアウト。低速なマシンでも問題なく動作するはずです。
LOGIN_TIMEOUT | 180 | ログインタイムアウト（秒）。プロンプト表示と手動ログインの2回待機します。
EMAIL | | ログイン時のデフォルトメールアドレス。
PASSWORD | | すべてのログインに使用できるデフォルトパスワード。
EG_EMAIL | | ログイン用のEpic Gamesメールアドレス。メールアドレスを上書きします。
EG_PASSWORD | | Epic Gamesのログインパスワード。PASSWORDを上書きします。
EG_OTPKEY | | Epic Games MFA OTPキー。
EG_PARENTALPIN | | Epic Gamesの保護者向け制限PIN。
PG_EMAIL | | Prime Gamingのログイン用メールアドレス。メールアドレスを上書きします。
PG_PASSWORD | | Prime Gamingのログインパスワード。PASSWORDを上書きします。
PG_OTPKEY | | Prime Gaming MFA OTPキー。
PG_REDEEM | 0 | Prime Gaming: 外部ストアでキーを引き換えてみてください（実験的機能）。
PG_CLAIMDLC | 0 | Prime Gaming: DLC を入手してみてください (実験的)。
GOG_EMAIL | | GOGログイン用のメールアドレス。EMAILを上書きします。
GOG_PASSWORD | | GOGログイン用のパスワード。PASSWORDを上書きします。
GOG_NEWSLETTER | 0 | ゲームを受け取った後、ニュースレターの購読を解除しないでください。
LG_EMAIL | | レガシーゲーム：引き換えに使用するメールアドレス（設定されていない場合は、PG_EMAILがデフォルトとなります）

src/config.jsすべてのオプションについてはこちらをご覧ください。

オプションの設定方法
オプションはコマンドに直接追加することも、ファイルに記述して読み込むこともできます。

ドッカー
-e VAR=VAL変数は、たとえばdocker run -e EMAIL=foo@bar.baz -e NOTIFY='tgram://bottoken/ChatID' ...または を使用して渡すことができます。--env-file fgc.envここで はfgc.envホスト システム上のファイルです (ドキュメントdocker cpを参照)。また、設定ファイルを/fgc/data/config.envボリュームにしてfgc、ホスト上の の代わりに他のデータと一緒に保存することもできます(例)。docker compose (または Portainer など)を使用している場合は、 セクションにオプションを記述できますenvironment:。

Dockerなし
Linux/macOS では、設定したい変数にプレフィックスを付けることができます。たとえば、 とするEMAIL=foo@bar.baz SHOW=1 node epic-gamesとブラウザが表示され、ログインメールの入力を求められなくなります。Windows ではset、を使用する必要があります。例:。また、 にオプションを記述することもできます。これはdotenvdata/config.envによって読み込まれます。

通知
スクリプトは、ゲームが正常に取得された場合や、ログインが必要な場合、CAPTCHAに遭遇した場合（発生しないはずですが）などのエラーが発生した場合に通知を送信しようとします。

appriseNOTIFYは通知に使用され、Pushover、Slack、Telegram、SMS、Eメール、デスクトップ通知、カスタム通知など、多くのサービスを提供しています。使用したい通知サービスを設定するだけで済みます。NOTIFY='mailto://myemail:mypass@gmail.com' 'pbul://o.gn5kj6nfhv736I7jC3cj3QLRiyhgl98b'サービス一覧と使用例を参照してください。

自動ログイン、二段階認証
メールアドレス、パスワード、OTPキーのオプションを設定すれば、プロンプトは表示されず、ログインは自動的に行われます。Cookieが更新されるため、すべてのストアでログイン状態が維持されるため、この設定は任意です。OTPキーを取得するには、ストアの認証アプリ追加ガイドに従うのが最も簡単です。また、2段階認証の代替手段として、表示されているQRコードをお気に入りのアプリでスキャンすることもできます。

Epic Games :パスワードとセキュリティにアクセスし、「サードパーティ認証アプリ」を有効にし、「手動入力キー」をコピーして設定に使用しますEG_OTPKEY。
Prime Gaming : Amazonの「アカウントサービス › ログインとセキュリティ」にアクセスし、2段階認証 › 管理 › 新しいアプリを追加 › バーコードをスキャンできない場合は、太字のキーをコピーして設定してください。PG_OTPKEY
GOG：OTPはメールでのみ提供されます
パスワードやワンタイムパスワード（OTP）を平文で保存することはセキュリティリスクとなる可能性があるため、ご注意ください。必ず固有のパスワードまたは生成されたパスワードを使用してください。TODO：少なくとも保存時にbase64エンコードするオプションを提供するべきかもしれません。

Epic Games Store
node epic-games（ローカル環境またはDocker環境で）実行します。

Amazonプライムゲーミング
node prime-gaming（ローカル環境またはDocker環境で）実行します。

Amazon Gamesのゲームはすぐに利用できますが、外部ストアのゲームの場合は、アカウントをリンクするか、キーを引き換える必要があります。

アカウント連携が必要なストア：Epic Games、Battle.net、Origin。

キーの引き換えが必要なストア：GOG.com、Microsoft Games、Legacy Games。

キーと URL はコンソールに出力され、通知に含まれ、に保存されます。キーをdata/prime-gaming.json含むページのスクリーンショットもに保存されますdata/screenshots。外部ストアでキーを自動引き換えする機能（TODO解消）が実装されています。

定期的に実行
どのくらいの頻度で？
Epic Gamesは通常、毎週2本の無料ゲームを提供しており、クリスマス前は毎日無料ゲームを提供しています。Prime Gamingは毎月、またはプライムデー期間中はそれ以上の頻度で新しいゲームを提供しています。GOGは通常、2週間ごとに1本の新しいゲームを提供しています。Unreal Engineは毎月第1火曜日に新しいアセットを入手できます。

スクリプトを毎日実行しても問題ありません。

予約方法は？
コンテナ/スクリプトは現在利用可能なゲームを占有した後、終了します。定期的に実行させたい場合は、実行スケジュールを自分で設定する必要があります。

Linux/macOS: crontab -e(例)
macOS: launchd
Windowsの場合：タスクスケジューラ（例）、その他のオプション、または頻繁に再起動する場合は、コマンドを.bat自動起動のファイルに記述する...
どのOSでも： pm2のようなプロセスマネージャを使用する
Docker Composeもそれにcommand: bash -c "node epic-games; node prime-gaming; node gog; echo sleeping; sleep 1d"加えて追加しますrestart: unless-stopped。
サーバーモードが追加されており、`node server` で自動的に継続実行が可能です。

## MCP Server / Openclaw 連携
このフォークでは Openclaw (<https://docs.openclaw.ai/ja-JP>) などと連携するための MCP サーバー機能が含まれています。
`node mcp-server.js` を起動することで、AI エージェントが自動的に各種スクリプトを実行し、取得済みゲームのリストを参照できるようになります。

