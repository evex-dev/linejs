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

- そもそもparamではない場合😇

```python
def deleteOtherFromChat(self, to, mid):
        METHOD_NAME = "deleteOtherFromChat"
        if type(mid) == list:
            _lastReq = None
            for _mid in mid:
                print(f"[deleteOtherFromChat] The parameter 'mid' should be str")
                _lastReq = self.deleteOtherFromChat(to, _mid)
            return _lastReq
        sqrd = [
            128,
            1,
            0,
            1,
            0,
            0,
            0,
            19,
            100,
            101,
            108,
            101,
            116,
            101,
            79,
            116,
            104,
            101,
            114,
            70,
            114,
            111,
            109,
            67,
            104,
            97,
            116,
            0,
            0,
            0,
            0,
        ]
        sqrd += [12, 0, 1]
        sqrd += [8, 0, 1, 0, 0, 0, 0]  # seq?
        sqrd += [11, 0, 2, 0, 0, 0, len(to)]
        for value in to:
            sqrd.append(ord(value))
        sqrd += [14, 0, 3, 11, 0, 0, 0, 1, 0, 0, 0, len(mid)]
        for value in mid:
            sqrd.append(ord(value))
        sqrd += [0, 0]
        return self.postPackDataAndGetUnpackRespData(
            self.LINE_NORMAL_ENDPOINT, sqrd, readWith=f"TalkService.{METHOD_NAME}"
        )
```

解説

最初のsqrdはthriftのメッセージ`deleteOtherFromChat`を意味します

`sqrd = [128, 1, 0, 1] + self.getStringBytes("METHODNAME") + [0, 0, 0, 0]`も上と同じ意味です

`sqrd += [12, 0, 1]`は`[12,1,[]]`を意味します。続くバイト列はその中身です

`sqrd += [8, 0, 1, 0, 0, 0, 0]`は`[8,1,0]`を意味します。

```py
sqrd += [11, 0, 2, 0, 0, 0, len(to)]
for value in to:
    sqrd.append(ord(value))
```

は`[11,2,to]`を意味します。

```py
sqrd += [14, 0, 3, 11, 0, 0, 0, 1, 0, 0, 0, len(mid)]
for value in mid:
    sqrd.append(ord(value))
```

は`[14,3,[11,[mid]]]`を意味します。

`sqrd += [0, 0]`はメッセージの終了を意味します

つまり、
```py
param = [12,1,[
    [8,1,0],
    [11,2,to],
    [14,3,[11,[mid]]]
]]
```
と変換できます
