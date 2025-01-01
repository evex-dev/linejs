## /docs

ドキュメントサイト: https://linejs.evex.land

## /packages

exportするパッケージ

- **/linejs** @evex/linejs
  - **/src**
    - **/core** メインのclient
    - **/e2ee** encrypt/decrypt
    - **/login** email, qr
    - **/polling** event, emit
    - **/request** fetch
    - **/service** LINEのservice
      - **/auth** LoginService + AuthService + AccessTokenRefreshService
      - **/call** CallService
      - **/channel** ChannelService
      - **/liff** LiffService
      - **/livetalk** SquareLiveTalkService
      - **/relation** RelationService
      - **/square** SquareService + SquareBotService
      - **/talk** TalkService + SyncService
    - **/storage**
    - **/thrift**
      - **/readwrite** read/write
      - **/rename** ThriftRenameParser
    - **/timeline** voom, note
- **/types** @evex/linejs-types
  - line_types struct, enumの型定義とenumの値
  - thrift 解析したthrift

## /resources

ファイル等

- **/line**

## /tools

ツール

- **/device**
  - latest_device 最新verを取得
- **/thrift**
  - parser thriftファイル解析
  - gen_typedef line_types生成
  - gen_struct NestedArray
  - java2thrift java解析
