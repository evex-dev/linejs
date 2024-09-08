### Methodの実装方法

#### CHRLINEを見る

例:

```python
def getChats(self, mids, withMembers=True, withInvitees=True):
    METHOD_NAME = "getChats"
    if type(mids) != list:
        raise Exception("[getChats] mids must be a list")
    params = [
        [12, 1, [[15, 1, [11, mids]], [2, 2, withMembers], [2, 3, withInvitees]]]
    ]
    sqrd = self.generateDummyProtocol(METHOD_NAME, params, 3)
    return self.postPackDataAndGetUnpackRespData(
        self.LINE_NORMAL_ENDPOINT, sqrd, readWith=f"TalkService.{METHOD_NAME}"
    )
```

#### TSに変換する

- 引数をコピー

```ts
public async getChats(options: {
		mids: string[];         //引数
		withMembers?: boolean;  //引数(任意)
		withInvitees?: boolean; //引数(任意)
	}): Promise<LooseType> {    //仮の型
		const { mids, withInvitees, withMembers } = {
			withInvitees: true, //デフォルトの値
			withMembers: true,  //デフォルトの値
			...options,
		};
	}
```

- 返り値の型を調べる

  `/linejs/archive/_server/line_.thrift`を開いて、`getChats(`で検索する(見つからなかったら`line.thrift`も見る)

`GetChatsResponse getChats(1: GetChatsRequest request) throws(1: TalkException e);`

この関数は`GetChatsResponse`の型を返すので、以下のようにする

```ts
public async getChats(options: {
		mids: string[];         //引数
		withMembers?: boolean;  //引数(任意)
		withInvitees?: boolean; //引数(任意)
	}): Promise<LINETypes.GetChatsResponse>
```

見つからなかった場合、`LooseType`で続行

- request

もしparamが`[[12, 1, [~]]]`の形、または
`return ~ServiceStruct.SendRequestByName(self, METHOD_NAME, params)` の場合

```ts
return await this.request(
	[
		[15, 1, [11, mids]],
		[2, 2, withMembers],
		[2, 3, withInvitees],
	], // ~の中身
	"getChats",
	this.TalkService_PROTOCOL_TYPE,
	"GetChatsResponse", //上で見つけた型、見つからなかったら false(bool)
	this.TalkService_API_PATH,
);
```

else

```ts
return await this.direct_request(
	[
		[12, 1, [[15, 1, [11, mids]], [2, 2, withMembers], [
			2,
			3,
			withInvitees,
		]]],
	],
	"getChats",
	this.TalkService_PROTOCOL_TYPE,
	"GetChatsResponse", //上で見つけた型、見つからなかったら false(bool)
	this.TalkService_API_PATH,
);
```

- thriftの返り値が単純でない場合

例:

`list<Contact> getContacts(2: list<string> ids) throws(1: TalkException e);`

`map<string, Contact> findContactsByPhone(2: set<string> phones) throws(1: TalkException e);`

以下のようにlistならmap()、mapならforなどで頑張る

```js
public async getContactsV2(options: {
		mids: string[];
	}): Promise<LINETypes.Contact[]> {  //list
		const { mids } = { ...options };
		return (
			await this.request(
				[[15, 1, [11, mids]]],
				"getContactsV2",
				this.TalkService_PROTOCOL_TYPE,
				false,  // falseで無変換
				this.TalkService_API_PATH,
			)
		).map((e: LooseType) => this.parser.rename_thrift("Contact", e));   //thriftの型をここへ
	}
```
