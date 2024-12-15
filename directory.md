## /docs

ドキュメント

## /packages

exportするパッケージ

- **/linejs** @evex/linejs
  - **/src**
    - **/core** メインのclient
    - **/e2ee** encrypt/decrypt
    - **/login** email, qr
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
  - data2typedef line_types生成
  - java2thrift apk解析
