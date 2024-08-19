enum ApplicationType {
    IOS = 16;
    IOS_RC = 17;
    IOS_BETA = 18;
    IOS_ALPHA = 19;
    ANDROID = 32;
    ANDROID_RC = 33;
    ANDROID_BETA = 34;
    ANDROID_ALPHA = 35;
    WAP = 48;
    WAP_RC = 49;
    WAP_BETA = 50;
    WAP_ALPHA = 51;
    BOT = 64;
    BOT_RC = 65;
    BOT_BETA = 66;
    BOT_ALPHA = 67;
    WEB = 80;
    WEB_RC = 81;
    WEB_BETA = 82;
    WEB_ALPHA = 83;
    DESKTOPWIN = 96;
    DESKTOPWIN_RC = 97;
    DESKTOPWIN_BETA = 98;
    DESKTOPWIN_ALPHA = 99;
    DESKTOPMAC = 112;
    DESKTOPMAC_RC = 113;
    DESKTOPMAC_BETA = 114;
    DESKTOPMAC_ALPHA = 115;
    CHANNELGW = 128;
    CHANNELGW_RC = 129;
    CHANNELGW_BETA = 130;
    CHANNELGW_ALPHA = 131;
    CHANNELCP = 144;
    CHANNELCP_RC = 145;
    CHANNELCP_BETA = 146;
    CHANNELCP_ALPHA = 147;
    WINPHONE = 160;
    WINPHONE_RC = 161;
    WINPHONE_BETA = 162;
    WINPHONE_ALPHA = 163;
    BLACKBERRY = 176;
    BLACKBERRY_RC = 177;
    BLACKBERRY_BETA = 178;
    BLACKBERRY_ALPHA = 179;
    WINMETRO = 192;
    WINMETRO_RC = 193;
    WINMETRO_BETA = 194;
    WINMETRO_ALPHA = 195;
    S40 = 208;
    S40_RC = 209;
    S40_BETA = 210;
    S40_ALPHA = 211;
    CHRONO = 224;
    CHRONO_RC = 225;
    CHRONO_BETA = 226;
    CHRONO_ALPHA = 227;
    TIZEN = 256;
    TIZEN_RC = 257;
    TIZEN_BETA = 258;
    TIZEN_ALPHA = 259;
    VIRTUAL = 272;
    FIREFOXOS = 288;
    FIREFOXOS_RC = 289;
    FIREFOXOS_BETA = 290;
    FIREFOXOS_ALPHA = 291;
    IOSIPAD = 304;
    IOSIPAD_RC = 305;
    IOSIPAD_BETA = 306;
    IOSIPAD_ALPHA = 307;
    BIZIOS = 320;
    BIZIOS_RC = 321;
    BIZIOS_BETA = 322;
    BIZIOS_ALPHA = 323;
    BIZANDROID = 336;
    BIZANDROID_RC = 337;
    BIZANDROID_BETA = 338;
    BIZANDROID_ALPHA = 339;
    BIZBOT = 352;
    BIZBOT_RC = 353;
    BIZBOT_BETA = 354;
    BIZBOT_ALPHA = 355;
    CHROMEOS = 368;
    CHROMEOS_RC = 369;
    CHROMEOS_BETA = 370;
    CHROMEOS_ALPHA = 371;
    ANDROIDLITE = 384;
    ANDROIDLITE_RC = 385;
    ANDROIDLITE_BETA = 386;
    ANDROIDLITE_ALPHA = 387;
    WIN10 = 400;
    WIN10_RC = 401;
    WIN10_BETA = 402;
    WIN10_ALPHA = 403;
    BIZWEB = 416;
    BIZWEB_RC = 417;
    BIZWEB_BETA = 418;
    BIZWEB_ALPHA = 419;
    DUMMYPRIMARY = 432;
    DUMMYPRIMARY_RC = 433;
    DUMMYPRIMARY_BETA = 434;
    DUMMYPRIMARY_ALPHA = 435;
    SQUARE = 448;
    SQUARE_RC = 449;
    SQUARE_BETA = 450;
    SQUARE_ALPHA = 451;
    INTERNAL = 464;
    INTERNAL_RC = 465;
    INTERNAL_BETA = 466;
    INTERNAL_ALPHA = 467;
    CLOVAFRIENDS = 480;
    CLOVAFRIENDS_RC = 481;
    CLOVAFRIENDS_BETA = 482;
    CLOVAFRIENDS_ALPHA = 483;
}

enum ExtendedProfileAttribute {
    # Error? ExtendedProfileAttribute.java
}

enum PrivacyLevelType {
    PUBLIC = 0;
    PRIVATE = 1;
}

enum PaidCallerIdStatus {
    NOT_SPECIFIED = 0,
    VALID = 1,
    VERIFICATION_REQUIRED = 2,
    NOT_PERMITTED = 3,
    LIMIT_EXCEEDED = 4,
    LIMIT_EXCEEDED_AND_VERIFICATION_REQUIRED = 5,
}

enum PaidCallProductType {
    COIN = 0;
    CREDIT = 1;
    MONTHLY = 2;
}

enum PaidCallType {
    OUT = 0;
    IN = 1;
    TOLLFREE = 2;
    RECORD = 3;
    AD = 4;
    CS = 5;
}

enum BotType {
    RESERVED = 0;
    OFFICIAL = 1;
    LINE_AT_0 = 2;
    LINE_AT = 3;
}

enum BuddyOnAirLabel {
    ON_AIR = 0;
    LIVE = 1;
}

enum BuddyBannerLinkType {
    BUDDY_BANNER_LINK_HIDDEN = 0;
    BUDDY_BANNER_LINK_MID = 1;
    BUDDY_BANNER_LINK_URL = 2;
}

enum BuddyOnAirType {
    NORMAL = 0;
    LIVE = 1;
    VOIP = 2;
}

enum Diff {
    ADDED = 0;
    UPDATED = 1;
    REMOVED = 2;
}

enum ReportType {
    ADVERTISING = 1;
    GENDER_HARASSMENT = 2;
    HARASSMENT = 3;
    OTHER = 4;
}

enum SyncTriggerReason {
    OTHER = 0;
    REVISION_GAP_TOO_LARGE = 1;
    OPERATION_EXPIRED = 2;
}

enum ReportCategory {
    PUSH_NORMAL_PLAIN = 0;
    PUSH_NORMAL_E2EE = 1;
    PUSH_VOIP_PLAIN = 2;
    PUSH_VOIP_E2EE = 3;
}

enum BuddyResultState {
    ACCEPTED = 1;
    SUCCEEDED = 2;
    FAILED = 3;
    CANCELLED = 4;
    NOTIFY_FAILED = 5;
    STORING = 11;
    UPLOADING = 21;
    NOTIFYING = 31;
    REMOVING_SUBSCRIPTION = 41;
    UNREGISTERING_ACCOUNT = 42;
    NOTIFYING_LEAVE_CHAT = 43;
}

enum BuddySearchRequestSource {
    NA = 0;
    FRIEND_VIEW = 1;
    OFFICIAL_ACCOUNT_VIEW = 2;
}

enum CarrierCode {
    NOT_SPECIFIED = 0;
    JP_DOCOMO = 1;
    JP_AU = 2;
    JP_SOFTBANK = 3;
    JP_DOCOMO_LINE = 4;
    KR_SKT = 17;
    KR_KT = 18;
    KR_LGT = 19;
}

enum ChannelConfiguration {
    MESSAGE = 0;
    MESSAGE_NOTIFICATION = 1;
    NOTIFICATION_CENTER = 2;
}

enum ChannelPermission {
    PROFILE = 0;
    FRIENDS = 1;
    GROUP = 2;
}

enum ChannelFeatureLicense {
    BLE_LCS_API_USABLE = 26;
    PROHIBIT_MINIMIZE_CHANNEL_BROWSER = 27;
    ALLOW_IOS_WEBKIT = 28;
}

enum ChannelErrorCode {
    ILLEGAL_ARGUMENT = 0;
    INTERNAL_ERROR = 1;
    CONNECTION_ERROR = 2;
    AUTHENTICATIONI_FAILED = 3;
    NEED_PERMISSION_APPROVAL = 4;
    COIN_NOT_USABLE = 5;
    WEBVIEW_NOT_ALLOWED = 6;
}

enum ChannelSyncType {
    SYNC = 0;
    REMOVE = 1;
    REMOVE_ALL = 2;
}

enum LoginType {
    ID_CREDENTIAL = 0;
    QRCODE = 1;
    ID_CREDENTIAL_WITH_E2EE = 2;
}

enum ContactAttribute {
    CONTACT_ATTRIBUTE_CAPABLE_VOICE_CALL = 1;
    CONTACT_ATTRIBUTE_CAPABLE_VIDEO_CALL = 2;
    CONTACT_ATTRIBUTE_CAPABLE_MY_HOME = 16;
    CONTACT_ATTRIBUTE_CAPABLE_BUDDY = 32;
}

enum ContactCategory {
    NORMAL = 0;
    RECOMMEND = 1;
}

enum ContactRelation {
    ONEWAY = 0;
    BOTH = 1;
    NOT_REGISTERED = 2;
}

enum AsymmetricKeyAlgorithm {
    ASYMMETRIC_KEY_ALGORITHM_RSA = 1;
    ASYMMETRIC_KEY_ALGORITHM_ECDH = 2;
}

enum ContactSetting {
    CONTACT_SETTING_NOTIFICATION_DISABLE = 1;
    CONTACT_SETTING_DISPLAY_NAME_OVERRIDE = 2;
    CONTACT_SETTING_CONTACT_HIDE = 4;
    CONTACT_SETTING_FAVORITE = 8;
    CONTACT_SETTING_DELETE = 16;
}

enum ContactStatus {
    UNSPECIFIED = 0;
    FRIEND = 1;
    FRIEND_BLOCKED = 2;
    RECOMMEND = 3;
    RECOMMEND_BLOCKED = 4;
    DELETED = 5;
    DELETED_BLOCKED = 6;
}

enum ContactType {
    MID = 0;
    PHONE = 1;
    EMAIL = 2;
    USERID = 3;
    PROXIMITY = 4;
    GROUP = 5;
    USER = 6;
    QRCODE = 7;
    PROMOTION_BOT = 8;
    CONTACT_MESSAGE = 9;
    FRIEND_REQUEST = 10;
    REPAIR = 128;
    FACEBOOK = 2305;
    SINA = 2306;
    RENREN = 2307;
    FEIXIN = 2308;
    BBM = 2309;
    BEACON = 11;
}

enum GroupPreferenceAttribute {
    INVITATION_TICKET = 1;
    FAVORITE_TIMESTAMP = 2;
}

enum ContentType {
    NONE = 0;
    IMAGE = 1;
    VIDEO = 2;
    AUDIO = 3;
    HTML = 4;
    PDF = 5;
    CALL = 6;
    STICKER = 7;
    PRESENCE = 8;
    GIFT = 9;
    GROUPBOARD = 10;
    APPLINK = 11;
    LINK = 12;
    CONTACT = 13;
    FILE = 14;
    LOCATION = 15;
    POSTNOTIFICATION = 16;
    RICH = 17;
    CHATEVENT = 18;
    MUSIC = 19;
    PAYMENT = 20;
    EXTIMAGE = 21;
}

enum MessageRelationType {
    FORWARD = 0;
    AUTO_REPLY = 1;
    SUBORDINATE = 2;
}

enum CustomMode {
    PROMOTION_FRIENDS_INVITE = 1;
    CAPABILITY_SERVER_SIDE_SMS = 2;
    LINE_CLIENT_ANALYTICS_CONFIGURATION = 3;
}

enum RoomAttribute {
    ALL = 255;
    NOTIFICATION_SETTING = 1;
}

enum UserStatus {
    NORMAL = 0;
    UNBOUND = 1;
    UNREGISTERED = 2;
}

enum EmailConfirmationStatus {
    NOT_SPECIFIED = 0;
    NOT_YET = 1;
    DONE = 3;
    NEED_ENFORCED_INPUT = 4;
}

enum AccountMigrationPincodeType {
    NOT_APPLICABLE = 0;
    NOT_SET = 1;
    SET = 2;
    NEED_ENFORCED_INPUT = 3;
}

enum AccountMigrationCheckType {
    SKIP = 0;
    PINCODE = 1;
    SECURITY_CENTER = 2;
}

enum SecurityCenterSettingsType {
    NOT_APPLICABLE = 0;
    NOT_SET = 1;
    SET = 2;
    NEED_ENFORCED_INPUT = 3;
}

enum EmailConfirmationType {
    SERVER_SIDE_EMAIL = 0;
    CLIENT_SIDE_EMAIL = 1;
}

enum SquareChatAnnouncementType {
    TEXT_MESSAGE = 0;
}

enum SquareChatAttribute {
    NAME = 2;
    SQUARE_CHAT_IMAGE = 3;
    STATE = 4;
}

enum SquareMemberAttribute {
    DISPLAY_NAME = 1;
    PROFILE_IMAGE = 2;
    ABLE_TO_RECEIVE_MESSAGE = 3;
    MEMBERSHIP_STATE = 5;
    ROLE = 6;
    PREFERENCE = 7;
}

enum SquareMemberRelationAttribute {
    BLOCKED = 1;
}

enum SquarePreferenceAttribute {
    FAVORITE = 1;
    NOTI_FOR_NEW_JOIN_REQUEST = 2;
}

enum SquareState {
    ALIVE = 0;
    DELETED = 1;
    SUSPENDED = 2;
}

enum CommitMessageResultCode {
    DELIVERED = 0,
    DELIVERY_SKIPPED = 1,
    DELIVERY_RESTRICTED = 2,
}

enum ErrorCode {
    ILLEGAL_ARGUMENT = 0;
    AUTHENTICATION_FAILED = 1;
    DB_FAILED = 2;
    INVALID_STATE = 3;
    EXCESSIVE_ACCESS = 4;
    NOT_FOUND = 5;
    INVALID_MID = 9;
    NOT_A_MEMBER = 10;
    INVALID_LENGTH = 6;
    NOT_AVAILABLE_USER = 7;
    NOT_AUTHORIZED_DEVICE = 8;
    NOT_AUTHORIZED_SESSION = 14;
    INCOMPATIBLE_APP_VERSION = 11;
    NOT_READY = 12;
    NOT_AVAILABLE_SESSION = 13;
    SYSTEM_ERROR = 15;
    NO_AVAILABLE_VERIFICATION_METHOD = 16;
    NOT_AUTHENTICATED = 17;
    INVALID_IDENTITY_CREDENTIAL = 18;
    NOT_AVAILABLE_IDENTITY_IDENTIFIER = 19;
    INTERNAL_ERROR = 20;
    NO_SUCH_IDENTITY_IDENFIER = 21;
    DEACTIVATED_ACCOUNT_BOUND_TO_THIS_IDENTITY = 22;
    ILLEGAL_IDENTITY_CREDENTIAL = 23;
    UNKNOWN_CHANNEL = 24;
    NO_SUCH_MESSAGE_BOX = 25;
    NOT_AVAILABLE_MESSAGE_BOX = 26;
    CHANNEL_DOES_NOT_MATCH = 27;
    NOT_YOUR_MESSAGE = 28;
    MESSAGE_DEFINED_ERROR = 29;
    USER_CANNOT_ACCEPT_PRESENTS = 30;
    USER_NOT_STICKER_OWNER = 32;
    MAINTENANCE_ERROR = 33;
    ACCOUNT_NOT_MATCHED = 34;
    ABUSE_BLOCK = 35;
    NOT_FRIEND = 36;
    NOT_ALLOWED_CALL = 37;
    BLOCK_FRIEND = 38;
    INCOMPATIBLE_VOIP_VERSION = 39;
    INVALID_SNS_ACCESS_TOKEN = 40;
    EXTERNAL_SERVICE_NOT_AVAILABLE = 41;
    NOT_ALLOWED_ADD_CONTACT = 42;
    NOT_CERTIFICATED = 43;
    NOT_ALLOWED_SECONDARY_DEVICE = 44;
    INVALID_PIN_CODE = 45;
    NOT_FOUND_IDENTITY_CREDENTIAL = 46;
    EXCEED_FILE_MAX_SIZE = 47;
    EXCEED_DAILY_QUOTA = 48;
    NOT_SUPPORT_SEND_FILE = 49;
    MUST_UPGRADE = 50;
    NOT_AVAILABLE_PIN_CODE_SESSION = 51;
    EXPIRED_REVISION = 52;
    NOT_YET_PHONE_NUMBER = 54;
    BAD_CALL_NUMBER = 55;
    UNAVAILABLE_CALL_NUMBER = 56;
    NOT_SUPPORT_CALL_SERVICE = 57;
    CONGESTION_CONTROL = 58;
    NO_BALANCE = 59;
    NOT_PERMITTED_CALLER_ID = 60;
    NO_CALLER_ID_LIMIT_EXCEEDED = 61;
    CALLER_ID_VERIFICATION_REQUIRED = 62;
    NO_CALLER_ID_LIMIT_EXCEEDED_AND_VERIFICATION_REQUIRED = 63;
    MESSAGE_NOT_FOUND = 64;
    INVALID_ACCOUNT_MIGRATION_PINCODE_FORMAT = 65;
    ACCOUNT_MIGRATION_PINCODE_NOT_MATCHED = 66;
    ACCOUNT_MIGRATION_PINCODE_BLOCKED = 67;
    INVALID_PASSWORD_FORMAT = 69;
    FEATURE_RESTRICTED = 70;
    MESSAGE_NOT_DESTRUCTIBLE = 71;
    PAID_CALL_REDEEM_FAILED = 72;
    PREVENTED_JOIN_BY_TICKET = 73;
    SEND_MESSAGE_NOT_PERMITTED_FROM_LINE_AT = 75;
    SEND_MESSAGE_NOT_PERMITTED_WHILE_AUTO_REPLY = 76;
    SECURITY_CENTER_NOT_VERIFIED = 77;
    SECURITY_CENTER_BLOCKED_BY_SETTING = 78;
    SECURITY_CENTER_BLOCKED = 79;
    TALK_PROXY_EXCEPTION = 80;
    E2EE_INVALID_PROTOCOL = 81;
    E2EE_RETRY_ENCRYPT = 82;
    E2EE_UPDATE_SENDER_KEY = 83;
    E2EE_UPDATE_RECEIVER_KEY = 84;
    E2EE_INVALID_ARGUMENT = 85;
    E2EE_INVALID_VERSION = 86;
    E2EE_SENDER_DISABLED = 87;
    E2EE_RECEIVER_DISABLED = 88;
    E2EE_SENDER_NOT_ALLOWED = 89;
    E2EE_RECEIVER_NOT_ALLOWED = 90;
    E2EE_RESEND_FAIL = 91;
    E2EE_RESEND_OK = 92;
    HITOKOTO_BACKUP_NO_AVAILABLE_DATA = 93;
    E2EE_UPDATE_PRIMARY_DEVICE = 94;
    SUCCESS = 95;
    CANCEL = 96;
    E2EE_PRIMARY_NOT_SUPPORT = 97;
    E2EE_RETRY_PLAIN = 98;
    E2EE_RECREATE_GROUP_KEY = 99;
    E2EE_GROUP_TOO_MANY_MEMBERS = 100;
    SERVER_BUSY = 101;
    NOT_ALLOWED_ADD_FOLLOW = 102;
    INCOMING_FRIEND_REQUEST_LIMIT = 103;
    OUTGOING_FRIEND_REQUEST_LIMIT = 104;
    OUTGOING_FRIEND_REQUEST_QUOTA = 105;
    DUPLICATED = 106;
    BANNED = 107;
}

enum FeatureType {
    OBS_VIDEO = 1;
    OBS_GENERAL = 2;
}

enum GroupAttribute {
    NAME = 1;
    PICTURE_STATUS = 2;
    ALL = 255;
    PREVENTED_JOIN_BY_TICKET = 4;
    NOTIFICATION_SETTING = 8;
}

enum IdentityProvider {
    UNKNOWN = 0;
    LINE = 1;
    NAVER_KR = 2;
    LINE_PHONE = 3;
}

enum LoginResultType {
    SUCCESS = 1;
    REQUIRE_QRCODE = 2;
    REQUIRE_DEVICE_CONFIRM = 3;
    REQUIRE_SMS_CONFIRM = 4;
}

enum MessageOperationType {
    SEND_MESSAGE = 1;
    RECEIVE_MESSAGE = 2;
    READ_MESSAGE = 3;
    NOTIFIED_READ_MESSAGE = 4;
    NOTIFIED_JOIN_CHAT = 5;
    FAILED_SEND_MESSAGE = 6;
    SEND_CONTENT = 7;
    SEND_CONTENT_RECEIPT = 8;
    SEND_CHAT_REMOVED = 9;
    REMOVE_ALL_MESSAGES = 10;
}

enum MIDType {
    USER = 0;
    ROOM = 1;
    GROUP = 2;
    SQUARE = 3;
    SQUARE_CHAT = 4;
    SQUARE_MEMBER = 5;
    BOT = 6;
}

enum ServiceCode {
    UNKNOWN = 0;
    TALK = 1;
    SQUARE = 2;
}

enum FriendRequestDirection {
    INCOMING = 1;
    OUTGOING = 2;
}

enum FriendRequestMethod {
    TIMELINE = 1;
    NEARBY = 2;
    SQUARE = 3;
}

enum FriendRequestStatus {
    NONE = 0;
    AVAILABLE = 1;
    ALREADY_REQUESTED = 2;
    UNAVAILABLE = 3;
}

enum ModificationType {
    ADD = 0;
    REMOVE = 1;
    MODIFY = 2;
}

enum NotificationItemFetchMode {
    ALL = 0;
    APPEND = 1;
}

enum NotificationQueueType {
    GLOBAL = 1;
    MESSAGE = 2;
    PRIMARY = 3;
}

enum GroupCallMediaType {
    AUDIO = 1;
    VIDEO = 2;
}

enum PersonalInfo {
    EMAIL = 0;
    PHONE = 1;
    BIRTHDAY = 2;
    RAW_BIRTHDAY = 3;
}

enum NotificationStatus {
    NOTIFICATION_ITEM_EXIST = 1;
    TIMELINE_ITEM_EXIST = 2;
    NOTE_GROUP_NEW_ITEM_EXIST = 4;
    TIMELINE_BUDDYGROUP_CHANGED = 8;
    NOTE_ONE_TO_ONE_NEW_ITEM_EXIST = 16;
    ALBUM_ITEM_EXIST = 32;
    TIMELINE_ITEM_DELETED = 64;
    OTOGROUP_ITEM_EXIST = 128;
    GROUPHOME_NEW_ITEM_EXIST = 256;
    GROUPHOME_HIDDEN_ITEM_CHANGED = 512;
    NOTIFICATION_ITEM_CHANGED = 1024;
    BEAD_ITEM_HIDE = 2048;
    BEAD_ITEM_SHOW = 4096;
}

enum NotificationType {
    APPLE_APNS = 1;
    GOOGLE_C2DM = 2;
    NHN_NNI = 3;
    SKT_AOM = 4;
    MS_MPNS = 5;
    RIM_BIS = 6;
    GOOGLE_GCM = 7;
    NOKIA_NNAPI = 8;
    TIZEN = 9;
    LINE_BOT = 17;
    LINE_WAP = 18;
    APPLE_APNS_VOIP = 19;
    MS_WNS = 20;
    GOOGLE_FCM = 21;
}

enum OpStatus {
    NORMAL = 0;
    ALERT_DISABLED = 1;
    ALWAYS = 2;
}

enum OpType {
    END_OF_OPERATION = 0;
    UPDATE_PROFILE = 1;
    UPDATE_SETTINGS = 36;
    NOTIFIED_UPDATE_PROFILE = 2;
    REGISTER_USERID = 3;
    ADD_CONTACT = 4;
    NOTIFIED_ADD_CONTACT = 5;
    BLOCK_CONTACT = 6;
    UNBLOCK_CONTACT = 7;
    NOTIFIED_RECOMMEND_CONTACT = 8;
    CREATE_GROUP = 9;
    UPDATE_GROUP = 10;
    NOTIFIED_UPDATE_GROUP = 11;
    INVITE_INTO_GROUP = 12;
    NOTIFIED_INVITE_INTO_GROUP = 13;
    CANCEL_INVITATION_GROUP = 31;
    NOTIFIED_CANCEL_INVITATION_GROUP = 32;
    LEAVE_GROUP = 14;
    NOTIFIED_LEAVE_GROUP = 15;
    ACCEPT_GROUP_INVITATION = 16;
    NOTIFIED_ACCEPT_GROUP_INVITATION = 17;
    REJECT_GROUP_INVITATION = 34;
    NOTIFIED_REJECT_GROUP_INVITATION = 35;
    KICKOUT_FROM_GROUP = 18;
    NOTIFIED_KICKOUT_FROM_GROUP = 19;
    CREATE_ROOM = 20;
    INVITE_INTO_ROOM = 21;
    NOTIFIED_INVITE_INTO_ROOM = 22;
    LEAVE_ROOM = 23;
    NOTIFIED_LEAVE_ROOM = 24;
    SEND_MESSAGE = 25;
    RECEIVE_MESSAGE = 26;
    SEND_MESSAGE_RECEIPT = 27;
    RECEIVE_MESSAGE_RECEIPT = 28;
    SEND_CONTENT_RECEIPT = 29;
    RECEIVE_ANNOUNCEMENT = 30;
    NOTIFIED_UNREGISTER_USER = 33;
    INVITE_VIA_EMAIL = 38;
    NOTIFIED_REGISTER_USER = 37;
    NOTIFIED_REQUEST_RECOVERY = 39;
    SEND_CHAT_CHECKED = 40;
    SEND_CHAT_REMOVED = 41;
    NOTIFIED_FORCE_SYNC = 42;
    SEND_CONTENT = 43;
    SEND_MESSAGE_MYHOME = 44;
    NOTIFIED_UPDATE_CONTENT_PREVIEW = 45;
    REMOVE_ALL_MESSAGES = 46;
    NOTIFIED_UPDATE_PURCHASES = 47;
    DUMMY = 48;
    UPDATE_CONTACT = 49;
    NOTIFIED_RECEIVED_CALL = 50;
    CANCEL_CALL = 51;
    NOTIFIED_REDIRECT = 52;
    NOTIFIED_CHANNEL_SYNC = 53;
    FAILED_SEND_MESSAGE = 54;
    NOTIFIED_READ_MESSAGE = 55;
    FAILED_EMAIL_CONFIRMATION = 56;
    NOTIFIED_CHAT_CONTENT = 58;
    NOTIFIED_PUSH_NOTICENTER_ITEM = 59;
    NOTIFIED_JOIN_CHAT = 60;
    NOTIFIED_LEAVE_CHAT = 61;
    NOTIFIED_TYPING = 62;
    FRIEND_REQUEST_ACCEPTED = 63;
    DESTROY_MESSAGE = 64;
    NOTIFIED_DESTROY_MESSAGE = 65;
    UPDATE_PUBLICKEYCHAIN = 66;
    NOTIFIED_UPDATE_PUBLICKEYCHAIN = 67;
    NOTIFIED_BLOCK_CONTACT = 68;
    NOTIFIED_UNBLOCK_CONTACT = 69;
    UPDATE_GROUPPREFERENCE = 70;
    NOTIFIED_PAYMENT_EVENT = 71;
    REGISTER_E2EE_PUBLICKEY = 72;
    NOTIFIED_E2EE_KEY_EXCHANGE_REQ = 73;
    NOTIFIED_E2EE_KEY_EXCHANGE_RESP = 74;
    NOTIFIED_E2EE_MESSAGE_RESEND_REQ = 75;
    NOTIFIED_E2EE_MESSAGE_RESEND_RESP = 76;
    NOTIFIED_E2EE_KEY_UPDATE = 77;
    NOTIFIED_BUDDY_UPDATE_PROFILE = 78;
    NOTIFIED_UPDATE_LINEAT_TABS = 79;
    UPDATE_ROOM = 80;
    NOTIFIED_BEACON_DETECTED = 81;
    UPDATE_EXTENDED_PROFILE = 82;
    ADD_FOLLOW = 83;
    NOTIFIED_ADD_FOLLOW = 84;
    DELETE_FOLLOW = 85;
    NOTIFIED_DELETE_FOLLOW = 86;
    UPDATE_TIMELINE_SETTINGS = 87;
    NOTIFIED_FRIEND_REQUEST = 88;
    UPDATE_RINGBACK_TONE = 89;
    NOTIFIED_POSTBACK = 90;
    RECEIVE_READ_WATERMARK = 91;
    NOTIFIED_MESSAGE_DELIVERED = 92;
    NOTIFIED_UPDATE_CHAT_BAR = 93;
    NOTIFIED_CHATAPP_INSTALLED = 94;
    NOTIFIED_CHATAPP_UPDATED = 95;
    NOTIFIED_CHATAPP_NEW_MARK = 96;
    NOTIFIED_CHATAPP_DELETED = 97;
    NOTIFIED_CHATAPP_SYNC = 98;
    NOTIFIED_UPDATE_MESSAGE = 99;
}

enum PayloadType {
    PAYLOAD_BUY = 101;
    PAYLOAD_CS = 111;
    PAYLOAD_BONUS = 121;
    PAYLOAD_EVENT = 131;
}

enum PaymentPgType {
    PAYMENT_PG_NONE = 0;
    PAYMENT_PG_AU = 1;
    PAYMENT_PG_AL = 2;
}

enum PaymentType {
    PAYMENT_APPLE = 1;
    PAYMENT_GOOGLE = 2;
}

enum ProductBannerLinkType {
    BANNER_LINK_NONE = 0;
    BANNER_LINK_ITEM = 1;
    BANNER_LINK_URL = 2;
    BANNER_LINK_CATEGORY = 3;
}

enum ProductEventType {
    NO_EVENT = 0;
    CARRIER_ANY = 65537;
    BUDDY_ANY = 131073;
    INSTALL_IOS = 196609;
    INSTALL_ANDROID = 196610;
    MISSION_ANY = 262145;
    MUSTBUY_ANY = 327681;
}

enum StickerResourceType {
    STATIC = 1;
    ANIMATION = 2;
    SOUND = 3;
    ANIMATION_SOUND = 4;
    POPUP = 5;
    POPUP_SOUND = 6;
}

enum PlaceSearchProvider {
    GOOGLE = 0;
    BAIDU = 1;
}

enum PointErrorCode {
    REQUEST_DUPLICATION = 3001;
    INVALID_PARAMETER = 3002;
    NOT_ENOUGH_BALANCE = 3003;
    AUTHENTICATION_FAIL = 3004;
    API_ACCESS_FORBIDDEN = 3005;
    MEMBER_ACCOUNT_NOT_FOUND = 3006;
    SERVICE_ACCOUNT_NOT_FOUND = 3007;
    TRANSACTION_NOT_FOUND = 3008;
    ALREADY_REVERSED_TRANSACTION = 3009;
    MESSAGE_NOT_READABLE = 3010;
    HTTP_REQUEST_METHOD_NOT_SUPPORTED = 3011;
    HTTP_MEDIA_TYPE_NOT_SUPPORTED = 3012;
    NOT_ALLOWED_TO_DEPOSIT = 3013;
    NOT_ALLOWED_TO_PAY = 3014;
    TRANSACTION_ACCESS_FORBIDDEN = 3015;
    INVALID_SERVICE_CONFIGURATION = 4001;
    DCS_COMMUNICATION_FAIL = 5004;
    UPDATE_BALANCE_FAIL = 5007;
    SYSTEM_ERROR = 5999;
    SYSTEM_MAINTENANCE = 5888;
}

enum ProfileAttribute {
    ALL = 511;
    EMAIL = 1;
    DISPLAY_NAME = 2;
    PHONETIC_NAME = 4;
    PICTURE = 8;
    STATUS_MESSAGE = 16;
    ALLOW_SEARCH_BY_USERID = 32;
    ALLOW_SEARCH_BY_EMAIL = 64;
    BUDDY_STATUS = 128;
    MUSIC_PROFILE = 256;
}

enum PublicType {
    HIDDEN = 0;
    PUBLIC = 1000;
}

enum RedirectType {
    NONE = 0;
    EXPIRE_SECOND = 1;
}

enum RegistrationType {
    PHONE = 0;
    EMAIL_WAP = 1;
    FACEBOOK = 2305;
    SINA = 2306;
    RENREN = 2307;
    FEIXIN = 2308;
}

enum ChatRoomAnnouncementType {
    MESSAGE = 0;
    NOTE = 1;
}

enum SettingsAttribute {
    ALL = 2147483647;
    NOTIFICATION_ENABLE = 1;
    NOTIFICATION_MUTE_EXPIRATION = 2;
    NOTIFICATION_NEW_MESSAGE = 4;
    NOTIFICATION_GROUP_INVITATION = 8;
    NOTIFICATION_SHOW_MESSAGE = 16;
    NOTIFICATION_INCOMING_CALL = 32;
    NOTIFICATION_SOUND_MESSAGE = 256;
    NOTIFICATION_SOUND_GROUP = 512;
    NOTIFICATION_DISABLED_WITH_SUB = 65536;
    NOTIFICATION_PAYMENT = 131072;
    PRIVACY_SYNC_CONTACTS = 64;
    PRIVACY_SEARCH_BY_PHONE_NUMBER = 128;
    PRIVACY_SEARCH_BY_USERID = 8192;
    PRIVACY_SEARCH_BY_EMAIL = 16384;
    PRIVACY_ALLOW_SECONDARY_DEVICE_LOGIN = 2097152;
    PRIVACY_PROFILE_IMAGE_POST_TO_MYHOME = 8388608;
    PRIVACY_ALLOW_FRIEND_REQUEST = 1073741824;
    PRIVACY_RECV_MESSAGES_FROM_NOT_FRIEND = 33554432;
    PRIVACY_AGREE_USE_LINECOIN_TO_PAIDCALL = 67108864;
    PRIVACY_AGREE_USE_PAIDCALL = 134217728;
    CONTACT_MY_TICKET = 1024;
    IDENTITY_PROVIDER = 2048;
    IDENTITY_IDENTIFIER = 4096;
    SNS_ACCOUNT = 524288;
    PHONE_REGISTRATION = 1048576;
    PREFERENCE_LOCALE = 32768;
    CUSTOM_MODE = 4194304;
    EMAIL_CONFIRMATION_STATUS = 16777216;
    ACCOUNT_MIGRATION_PINCODE = 268435456;
    ENFORCED_INPUT_ACCOUNT_MIGRATION_PINCODE = 536870912;
    SECURITY_CENTER_SETTINGS = 262144;
}

enum SettingsAttributeEx {
    NOTIFICATION_ENABLE = 0;
    NOTIFICATION_MUTE_EXPIRATION = 1;
    NOTIFICATION_NEW_MESSAGE = 2;
    NOTIFICATION_GROUP_INVITATION = 3;
    NOTIFICATION_SHOW_MESSAGE = 4;
    NOTIFICATION_INCOMING_CALL = 5;
    NOTIFICATION_SOUND_MESSAGE = 8;
    NOTIFICATION_SOUND_GROUP = 9;
    NOTIFICATION_DISABLED_WITH_SUB = 16;
    NOTIFICATION_PAYMENT = 17;
    NOTIFICATION_MENTION = 40;
    NOTIFICATION_THUMBNAIL = 45;
    PRIVACY_SYNC_CONTACTS = 6;
    PRIVACY_SEARCH_BY_PHONE_NUMBER = 7;
    PRIVACY_SEARCH_BY_USERID = 13;
    PRIVACY_SEARCH_BY_EMAIL = 14;
    PRIVACY_ALLOW_SECONDARY_DEVICE_LOGIN = 21;
    PRIVACY_PROFILE_IMAGE_POST_TO_MYHOME = 23;
    PRIVACY_PROFILE_MUSIC_POST_TO_MYHOME = 35;
    PRIVACY_ALLOW_FRIEND_REQUEST = 30;
    PRIVACY_RECV_MESSAGES_FROM_NOT_FRIEND = 25;
    PRIVACY_AGREE_USE_LINECOIN_TO_PAIDCALL = 26;
    PRIVACY_AGREE_USE_PAIDCALL = 27;
    CONTACT_MY_TICKET = 10;
    IDENTITY_PROVIDER = 11;
    IDENTITY_IDENTIFIER = 12;
    SNS_ACCOUNT = 19;
    PHONE_REGISTRATION = 20;
    PREFERENCE_LOCALE = 15;
    CUSTOM_MODE = 22;
    EMAIL_CONFIRMATION_STATUS = 24;
    ACCOUNT_MIGRATION_PINCODE = 28;
    ENFORCED_INPUT_ACCOUNT_MIGRATION_PINCODE = 29;
    SECURITY_CENTER_SETTINGS = 18;
    E2EE_ENABLE = 33;
    ENABLE_SOUND_TO_TEXT = 47;
    HITOKOTO_BACKUP_REQUESTED = 34;
    CONTACT_ALLOW_FOLLOWING = 36;
    PRIVACY_ALLOW_NEARBY = 37;
    AGREEMENT_NEARBY = 38;
    AGREEMENT_SQUARE = 39;
    ALLOW_UNREGISTRATION_SECONDARY_DEVICE = 41;
    AGREEMENT_BOT_USE = 42;
    AGREEMENT_SHAKE_FUNCTION = 43;
    AGREEMENT_MOBILE_CONTACT_NAME = 44;
    AGREEMENT_SOUND_TO_TEXT = 46;
}

enum SnsIdType {
    FACEBOOK = 1;
    SINA = 2;
    RENREN = 3;
    FEIXIN = 4;
    BBM = 5;
}

enum SpammerReason {
    OTHER = 0;
    ADVERTISING = 1;
    GENDER_HARASSMENT = 2;
    HARASSMENT = 3;
}

enum SyncActionType {
    SYNC = 0;
    REPORT = 1;
}

enum SpotCategory {
    UNKNOWN = 0;
    GOURMET = 1;
    BEAUTY = 2;
    TRAVEL = 3;
    SHOPPING = 4;
    ENTERTAINMENT = 5;
    SPORTS = 6;
    TRANSPORT = 7;
    LIFE = 8;
    HOSPITAL = 9;
    FINANCE = 10;
    EDUCATION = 11;
    OTHER = 12;
    ALL = 10000;
}

enum SyncCategory {
    PROFILE = 0;
    SETTINGS = 1;
    OPS = 2;
    CONTACT = 3;
    RECOMMEND = 4;
    BLOCK = 5;
    GROUP = 6;
    ROOM = 7;
    NOTIFICATION = 8;
    ADDRESS_BOOK = 9;
}

enum TMessageBoxStatus {
    ACTIVATED = 1;
    UNREAD = 2;
}

enum UniversalNotificationServiceErrorCode {
    INTERNAL_ERROR = 0;
    INVALID_KEY = 1;
    ILLEGAL_ARGUMENT = 2;
    TOO_MANY_REQUEST = 3;
    AUTHENTICATION_FAILED = 4;
    NO_WRITE_PERMISSION = 5;
}

enum UnregistrationReason {
    UNREGISTRATION_REASON_UNREGISTER_USER = 1;
    UNREGISTRATION_REASON_UNBIND_DEVICE = 2;
}

enum UserAgeType {
    OVER = 1;
    UNDER = 2;
    UNDEFINED = 3;
}

enum VerificationMethod {
    NO_AVAILABLE = 0;
    PIN_VIA_SMS = 1;
    CALLERID_INDIGO = 2;
    PIN_VIA_TTS = 4;
    SKIP = 10;
}

enum VerificationResult {
    FAILED = 0;
    OK_NOT_REGISTERED_YET = 1;
    OK_REGISTERED_WITH_SAME_DEVICE = 2;
    OK_REGISTERED_WITH_ANOTHER_DEVICE = 3;
}

enum WapInvitationType {
    REGISTRATION = 1;
    CHAT = 2;
}

enum MediaType {
    AUDIO = 1;
    VIDEO = 2;
}

enum SQErrorCode {
    UNKNOWN = 0;
    ILLEGAL_ARGUMENT = 400;
    AUTHENTICATION_FAILURE = 401;
    FORBIDDEN = 403;
    NOT_FOUND = 404;
    REVISION_MISMATCH = 409;
    PRECONDITION_FAILED = 410;
    INTERNAL_ERROR = 500;
    NOT_IMPLEMENTED = 501;
    TRY_AGAIN_LATER = 505;
}

enum SquareEventType {
    RECEIVE_MESSAGE = 0;
    SEND_MESSAGE = 1;
    NOTIFIED_JOIN_SQUARE_CHAT = 2;
    NOTIFIED_INVITE_INTO_SQUARE_CHAT = 3;
    NOTIFIED_LEAVE_SQUARE_CHAT = 4;
    NOTIFIED_DESTROY_MESSAGE = 5;
    NOTIFIED_MARK_AS_READ = 6;
    NOTIFIED_UPDATE_SQUARE_MEMBER_PROFILE = 7;
    NOTIFIED_KICKOUT_FROM_SQUARE = 19;
    NOTIFIED_SHUTDOWN_SQUARE = 18;
    NOTIFIED_DELETE_SQUARE_CHAT = 20;
    NOTIFIED_UPDATE_SQUARE_CHAT_PROFILE_NAME = 30;
    NOTIFIED_UPDATE_SQUARE_CHAT_PROFILE_IMAGE = 31;
    NOTIFIED_UPDATE_SQUARE_CHAT_ANNOUNCEMENT = 37;
    NOTIFIED_ADD_BOT = 33;
    NOTIFIED_REMOVE_BOT = 34;
    NOTIFIED_UPDATE_SQUARE = 8;
    NOTIFIED_UPDATE_SQUARE_STATUS = 9;
    NOTIFIED_UPDATE_SQUARE_AUTHORITY = 10;
    NOTIFIED_UPDATE_SQUARE_MEMBER = 11;
    NOTIFIED_UPDATE_SQUARE_CHAT = 12;
    NOTIFIED_UPDATE_SQUARE_CHAT_STATUS = 13;
    NOTIFIED_UPDATE_SQUARE_CHAT_MEMBER = 14;
    NOTIFIED_CREATE_SQUARE_MEMBER = 15;
    NOTIFIED_CREATE_SQUARE_CHAT_MEMBER = 16;
    NOTIFIED_UPDATE_SQUARE_MEMBER_RELATION = 17;
    NOTIFIED_UPDATE_SQUARE_FEATURE_SET = 32;
    NOTIFIED_UPDATE_SQUARE_NOTE_STATUS = 36;
    NOTIFICATION_JOIN_REQUEST = 21;
    NOTIFICATION_JOINED = 22;
    NOTIFICATION_PROMOTED_COADMIN = 23;
    NOTIFICATION_PROMOTED_ADMIN = 24;
    NOTIFICATION_DEMOTED_MEMBER = 25;
    NOTIFICATION_KICKED_OUT = 26;
    NOTIFICATION_SQUARE_DELETE = 27;
    NOTIFICATION_SQUARE_CHAT_DELETE = 28;
    NOTIFICATION_MESSAGE = 29;
}

enum SquareMemberRelationState {
    NONE = 1;
    BLOCKED = 2;
}

enum SquareFeatureControlState {
    DISABLED = 1;
    ENABLED = 2;
}

enum BooleanState {
    NONE = 0;
    OFF = 1;
    ON = 2;
}

enum SquareType {
    CLOSED = 0;
    OPEN = 1;
}

enum SquareChatType {
    OPEN = 1;
    SECRET = 2;
    ONE_ON_ONE = 3;
    SQUARE_DEFAULT = 4;
}

enum SquareErrorCode {
    UNKNOWN = 0;
    INTERNAL_ERROR = 500;
    NOT_IMPLEMENTED = 501;
    TRY_AGAIN_LATER = 503;
    MAINTENANCE = 505;
    ILLEGAL_ARGUMENT = 400;
    AUTHENTICATION_FAILURE = 401;
    FORBIDDEN = 403;
    NOT_FOUND = 404;
    REVISION_MISMATCH = 409;
    PRECONDITION_FAILED = 410;
}

enum SquareChatState {
    ALIVE = 0;
    DELETED = 1;
    SUSPENDED = 2;
}

enum SquareFeatureSetAttribute {
    CREATING_SECRET_SQUARE_CHAT = 1;
    INVITING_INTO_OPEN_SQUARE_CHAT = 2;
}

enum SquareMembershipState {
    JOIN_REQUESTED = 1;
    JOINED = 2;
    REJECTED = 3;
    LEFT = 4;
    KICK_OUT = 5;
    BANNED = 6;
    DELETED = 7;
}

enum SquareChatMemberAttribute {
    MEMBERSHIP_STATE = 4;
    NOTIFICATION_MESSAGE = 6;
}

enum SquareMemberRole {
    ADMIN = 1;
    CO_ADMIN = 2;
    MEMBER = 10;
}

enum PreconditionFailedExtraInfo {
    DUPLICATED_DISPLAY_NAME = 0;
}

enum SquareChatMembershipState {
    JOINED = 1;
    LEFT = 2;
}

enum FetchDirection {
    FORWARD = 1;
    BACKWARD = 2;
}

enum SquareAttribute {
    NAME = 1;
    WELCOME_MESSAGE = 2;
    PROFILE_IMAGE = 3;
    DESCRIPTION = 4;
    SEARCHABLE = 6;
    CATEGORY = 7;
    INVITATION_URL = 8;
    ABLE_TO_USE_INVITATION_URL = 9;
    STATE = 10;
}

enum SquareAuthorityAttribute {
    UPDATE_SQUARE_PROFILE = 1;
    INVITE_NEW_MEMBER = 2;
    APPROVE_JOIN_REQUEST = 3;
    CREATE_POST = 4;
    CREATE_OPEN_SQUARE_CHAT = 5;
    DELETE_SQUARE_CHAT_OR_POST = 6;
    REMOVE_SQUARE_MEMBER = 7;
    GRANT_ROLE = 8;
    ENABLE_INVITATION_TICKET = 9;
    CREATE_CHAT_ANNOUNCEMENT = 10;
}

enum SquareEventStatus {
    NORMAL = 1;
    ALERT_DISABLED = 2;
}

struct Location {
    1: string title;
    2: string address;
    3: double latitude;
    4: double longitude;
    5: string phone;
}

struct MessageBoxV2MessageId {
    1: i64 deliveredTime;
    2: i64 messageId;
}

struct MessageCommitResult {
    1: string requestId;
    2: BuddyResultState state;
    3: string messageStoreRequestId;
    4: list<string> messageIds;
    11: i64 receiverCount;
    12: i64 successCount;
    13: i64 failCount;
    14: i64 blockCount;
    15: i64 unregisteredCount;
    16: i64 unrelatedCount;
    21: string errorDescription;
}

struct CallHost {
    1: string host;
    2: i32 port;
    3: string zone;
}

struct AgeCheckDocomoResult {
    1: string authUrl;
    2: UserAgeType userAgeType;
}

struct AgeCheckRequestResult {
    1: string authUrl;
    2: string sessionId;
}

struct TextMessageAnnouncementContents {
    1: string messageId;
    2: string text;
    3: string senderSquareMemberMid;
    4: i64 createdAt;
}

struct SquareChatAnnouncementContents {
    1: TextMessageAnnouncementContents textMessageAnnouncementContents;
}

struct SquareChatAnnouncement {
    1: i64 announcementSeq;
    2: SquareChatAnnouncementType type;
    3: SquareChatAnnouncementContents contents;
}

struct Announcement {
    1: i32 index;
    10: bool forceUpdate;
    11: string title;
    12: string text;
    13: i64 createdTime;
    14: string pictureUrl;
    15: string thumbnailUrl;
}

struct ChannelProvider {
    1: string name;
}

struct E2EEPublicKey {
    1: i32 version;
    2: i32 keyId;
    4: binary keyData;
    5: i64 createdTime;
}

struct ChannelDomain {
    1: string host;
    2: bool removed;
}

struct E2EENegotiationResult {
    1: set<ContentType> allowedTypes;
    2: E2EEPublicKey publicKey;
}

struct OTPResult {
    1: string otpId;
    2: string otp;
}

struct Square {
    1: string mid;
    2: string name;
    3: string welcomeMessage;
    4: string profileImageObsHash;
    5: string desc;
    6: bool searchable;
    7: SquareType type;
    8: i32 categoryID;
    9: string invitationURL;
    10: i64 revision;
    11: bool ableToUseInvitationTicket;
    12: SquareState state;
}

struct SquareAuthority {
    1: string squareMid;
    2: SquareMemberRole updateSquareProfile;
    3: SquareMemberRole inviteNewMember;
    4: SquareMemberRole approveJoinRequest;
    5: SquareMemberRole createPost;
    6: SquareMemberRole createOpenSquareChat;
    7: SquareMemberRole deleteSquareChatOrPost;
    8: SquareMemberRole removeSquareMember;
    9: SquareMemberRole grantRole;
    10: SquareMemberRole enableInvitationTicket;
    11: i64 revision;
}

struct SquarePreference {
    1: i64 favoriteTimestamp;
    2: bool notiForNewJoinRequest;
}

struct SquareMember {
    1: string squareMemberMid;
    2: string squareMid;
    3: string displayName;
    4: string profileImageObsHash;
    5: bool ableToReceiveMessage;
    7: SquareMembershipState membershipState;
    8: SquareMemberRole role;
    9: i64 revision;
    10: SquarePreference preference;
    11: string joinMessage;
}

struct SquareMemberRelation {
    1: SquareMemberRelationState state;
    2: i64 revision;
}

struct SquareFeature {
    1: SquareFeatureControlState controlState;
    2: BooleanState booleanValue;
}

struct SquareFeatureSet {
    1: string squareMid;
    2: i64 revision;
    11: SquareFeature creatingSecretSquareChat;
    12: SquareFeature invitingIntoOpenSquareChat;
}

struct SquareStatus {
    1: i32 memberCount;
    2: i32 joinRequestCount;
    3: i64 lastJoinRequestAt;
    4: i32 openChatCount;
}

struct SquareChat {
    1: string squareChatMid;
    2: string squareMid;
    3: SquareChatType type;
    4: string name;
    5: string chatImageObsHash;
    6: i64 squareChatRevision;
    7: i32 maxMemberCount;
    8: SquareChatState state;
}

struct NoteStatus {
    1: i32 noteCount;
    2: i64 latestCreatedAt;
}

struct SquareInfo {
    1: Square square;
    2: SquareStatus squareStatus;
    3: NoteStatus squareNoteStatus;
}

struct BotUseInfo {
    1: bool botUseAgreementAccepted;
    2: bool botInFriends;
    3: string primaryApplication;
    4: string locale;
}

struct PaidCallAdCountry {
    1: string countryCode;
    2: string rateDivision;
}

struct PaidCallAdResult {
    1: i32 adRemains;
}

struct PaidCallBalance {
    1: PaidCallProductType productType;
    2: string productName;
    3: string unit;
    4: i32 limitedPaidBalance;
    5: i32 limitedFreeBalance;
    6: i32 unlimitedPaidBalance;
    7: i32 unlimitedFreeBalance;
    8: i64 startTime;
    9: i64 endTime;
    10: bool autopayEnabled;
}

struct PaidCallCurrencyExchangeRate {
    1: string currencyCode;
    2: string currencyName;
    3: string currencySign;
    4: bool preferred;
    5: string coinRate;
    6: string creditRate;
}

struct ExtendedProfileBirthday {
    1: string year;
    2: PrivacyLevelType yearPrivacyLevelType;
    3: bool yearEnabled;
    5: string day;
    6: PrivacyLevelType dayPrivacyLevelType;
    7: bool dayEnabled;
}

struct ExtendedProfile {
    1: ExtendedProfileBirthday birthday;
}

struct PaidCallDialing {
    1: PaidCallType type;
    2: string dialedNumber;
    3: string serviceDomain;
    4: PaidCallProductType productType;
    5: string productName;
    6: bool multipleProduct;
    7: PaidCallerIdStatus callerIdStatus;
    10: i32 balance;
    11: string unit;
    12: i32 rate;
    13: string displayCode;
    14: string calledNumber;
    15: string calleeNationalNumber;
    16: string calleeCallingCode;
    17: string rateDivision;
    20: i32 adMaxMin;
    21: i32 adRemains;
    22: string adSessionId;
}

struct SpotItem {
    2: string name;
    3: string phone;
    4: SpotCategory category;
    5: string mid;
    6: string countryAreaCode;
    10: bool freePhoneCallable;
}

struct SpotNearbyItem {
    2: SpotItem spotItem;
    11: Location location;
}

struct SpotNearbyResponse {
    1: list<SpotNearbyItem> spotNearbyItems;
}

struct SpotPhoneNumberResponse {
    1: list<SpotItem> spotItems;
}

struct PaidCallHistory {
    1: i64 seq;
    2: PaidCallType type;
    3: string dialedNumber;
    4: string calledNumber;
    5: string toMid;
    6: string toName;
    7: i64 setupTime;
    8: i64 startTime;
    9: i64 endTime;
    10: i64 duration;
    11: i32 terminate;
    12: PaidCallProductType productType;
    13: i32 charge;
    14: string unit;
    15: string result;
}

struct PaidCallHistoryResult {
    1: list<PaidCallHistory> historys;
    2: bool hasNext;
}

struct PaidCallMetadataResult {
    1: list<PaidCallCurrencyExchangeRate> currencyExchangeRates;
    2: list<string> recommendedCountryCodes;
    3: list<PaidCallAdCountry> adCountries;
}

struct PaidCallRedeemResult {
    1: string eventName;
    2: i32 eventAmount;
}

struct PaidCallResponse {
    1: CallHost host;
    2: PaidCallDialing dialing;
    3: string token;
    4: list<SpotItem> spotItems;
}

struct PaidCallUserRate {
    1: string countryCode;
    2: i32 rate;
    3: string rateDivision;
    4: string rateName;
}

struct ChannelInfo {
    1: string channelId;
    3: string name;
    4: string entryPageUrl;
    5: string descriptionText;
    6: ChannelProvider provider;
    7: PublicType publicType;
    8: string iconImage;
    9: list<string> permissions;
    11: string iconThumbnailImage;
    12: list<ChannelConfiguration> channelConfigurations;
    13: bool lcsAllApiUsable;
    14: set<ChannelPermission> allowedPermissions;
    15: list<ChannelDomain> channelDomains;
    16: i64 updatedTimestamp;
}

struct ApprovedChannelInfo {
    1: ChannelInfo channelInfo;
    2: i64 approvedAt;
}

struct ApprovedChannelInfos {
    1: list<ApprovedChannelInfo> approvedChannelInfos;
    2: i64 revision;
}

struct AuthQrcode {
    1: string qrcode;
    2: string verifier;
    3: string callbackUrl;
}

struct AnalyticsInfo {
    1: double gaSamplingRate;
    2: string tmid;
}

struct ContactTransition {
    1: string ownerMid;
    2: string targetMid;
    3: ContactStatus previousStatus;
    4: ContactStatus resultStatus;
}

struct UserTicketResponse {
    1: string mid;
    2: string userTicket;
}

struct BuddyBanner {
    1: BuddyBannerLinkType buddyBannerLinkType;
    2: string buddyBannerLink;
    3: string buddyBannerImageUrl;
}

struct BuddyDetail {
    1: string mid;
    2: i64 memberCount;
    3: bool onAir;
    4: bool businessAccount;
    5: bool addable;
    6: set<ContentType> acceptableContentTypes;
    7: bool capableMyhome;
}

struct Contact {
    1: string mid;
    2: i64 createdTime;
    10: ContactType type;
    11: ContactStatus status;
    21: ContactRelation relation;
    22: string displayName;
    23: string phoneticName;
    24: string pictureStatus;
    25: string thumbnailUrl;
    26: string statusMessage;
    27: string displayNameOverridden;
    28: i64 favoriteTime;
    31: bool capableVoiceCall;
    32: bool capableVideoCall;
    33: bool capableMyhome;
    34: bool capableBuddy;
    35: i32 attributes;
    36: i64 settings;
    37: string picturePath;
    38: string recommendParams;
    39: FriendRequestStatus friendRequestStatus;
    40: string musicProfile;
    42: string videoProfile;
}

struct BuddyList {
    1: string classification;
    2: string displayName;
    3: i32 totalBuddyCount;
    4: list<Contact> popularContacts;
}

struct RegisterWithPhoneNumberResult {
    1: string authToken;
    2: bool recommendEmailRegistration;
    3: string certificate;
}

struct BuddyMessageRequest {
    1: ContentType contentType;
    2: string text;
    3: Location location;
    4: binary content;
    5: map<string, string> contentMetadata;
}

struct BuddyOnAirUrls {
    1: map<string, string> hls;
    2: map<string, string> smoothStreaming;
}

struct BuddyOnAir {
    1: string mid;
    3: i64 freshnessLifetime;
    4: string onAirId;
    5: bool onAir;
    11: string text;
    12: i64 viewerCount;
    13: i64 targetCount;
    31: BuddyOnAirType onAirType;
    32: BuddyOnAirUrls onAirUrls;
}

struct BuddyProfile {
    1: string buddyId;
    2: string mid;
    3: string searchId;
    4: string displayName;
    5: string statusMessage;
    11: i64 contactCount;
}

struct CommitMessageResult {
    1: Message message;
    2: CommitMessageResultCode code;
    3: string reason;
    4: i64 successCount;
    5: i64 failCount;
    6: i64 unregisterCount;
    7: i64 blockCount;
}

struct BuddySearchResult {
    1: string mid;
    2: string displayName;
    3: string pictureStatus;
    4: string picturePath;
    5: string statusMessage;
    6: bool businessAccount;
}

struct SyncParamMid {
    1: string mid;
    2: Diff diff;
    3: i64 revision;
}

struct SIMInfo {
    1: string phoneNumber;
    2: string countryCode;
}

struct SyncParamContact {
    1: SyncParamMid syncParamMid;
    2: ContactStatus contactStatus;
}

struct ChannelDomains {
    1: list<ChannelDomain> channelDomains;
    2: i64 revision;
}

struct ProductCategory {
    1: i64 productCategoryId;
    2: string title;
    3: i32 productCount;
    4: bool newFlag;
}

struct ChannelInfos {
    1: list<ChannelInfo> channelInfos;
    2: i64 revision;
}

struct ChannelNotificationSetting {
    1: string channelId;
    2: string name;
    3: bool notificationReceivable;
    4: bool messageReceivable;
    5: bool showDefault;
}

struct ChannelSyncDatas {
    1: list<ChannelInfo> channelInfos;
    2: list<ChannelDomain> channelDomains;
    3: i64 revision;
    4: i64 expires;
}

struct NotiCenterEventData {
    1: string id;
    2: string to;
    3: string from_;
    4: string toChannel;
    5: string fromChannel;
    6: string eventType;
    7: i64 createdTime;
    8: i64 operationRevision;
    9: map<string, string> content;
    10: map<string, string> push;
}

struct ChannelToken {
    1: string token;
    2: string obsToken;
    3: i64 expiration;
    4: string refreshToken;
    5: string channelAccessToken;
}

struct ChannelSettings {
    1: bool unapprovedMessageReceivable;
}

struct ChannelIdWithLastUpdated {
    1: string channelId;
    2: i64 lastUpdated;
}

struct Coin {
    1: i32 freeCoinBalance;
    2: i32 payedCoinBalance;
    3: i32 totalCoinBalance;
    4: i32 rewardCoinBalance;
}

struct CoinPayLoad {
    1: i32 payCoin;
    2: i32 freeCoin;
    3: PayloadType type;
    4: i32 rewardCoin;
}

struct CoinHistory {
    1: i64 payDate;
    2: i32 coinBalance;
    3: i32 coin;
    4: string price;
    5: string title;
    6: bool refund;
    7: string paySeq;
    8: string currency;
    9: string currencySign;
    10: string displayPrice;
    11: CoinPayLoad payload;
    12: string channelId;
}

struct CoinHistoryCondition {
    1: i64 start;
    2: i32 size;
    3: string language;
    4: string eddt;
    5: PaymentType appStoreCode;
}

struct CoinHistoryResult {
    1: list<CoinHistory> historys;
    2: Coin balance;
    3: bool hasNext;
}

struct CoinProductItem {
    1: string itemId;
    2: i32 coin;
    3: i32 freeCoin;
    5: string currency;
    6: string price;
    7: string displayPrice;
    8: string name;
    9: string desc;
}

struct CoinPurchaseConfirm {
    1: string orderId;
    2: PaymentType appStoreCode;
    3: string receipt;
    4: string signature;
    5: string seller;
    6: string requestType;
    7: bool ignoreReceipt;
}

struct CoinPurchaseReservation {
    1: string productId;
    2: string country;
    3: string currency;
    4: string price;
    5: PaymentType appStoreCode;
    6: string language;
    7: PaymentPgType pgCode;
    8: string redirectUrl;
}

struct CoinUseReservationItem {
    1: string itemId;
    2: string itemName;
    3: i32 amount;
}

struct CoinUseReservation {
    1: string channelId;
    2: string shopOrderId;
    3: PaymentType appStoreCode;
    4: list<CoinUseReservationItem> items;
    5: string country;
}

struct CompactContact {
    1: string mid;
    2: i64 createdTime;
    3: i64 modifiedTime;
    4: ContactStatus status;
    5: i64 settings;
    6: string displayNameOverridden;
}

struct ContactModification {
    1: ModificationType type;
    2: string luid;
    11: list<string> phones;
    12: list<string> emails;
    13: list<string> userids;
}

struct ContactRegistration {
    1: Contact contact;
    10: string luid;
    11: ContactType contactType;
    12: string contactKey;
}

struct ContactReport {
    1: string mid;
    2: bool exists;
    3: Contact contact;
}

struct ContactReportResult {
    1: string mid;
    2: bool exists;
}

struct DeviceInfo {
    1: string deviceName;
    2: string systemName;
    3: string systemVersion;
    4: string model;
    10: CarrierCode carrierCode;
    11: string carrierName;
    20: ApplicationType applicationType;
}

struct EmailConfirmation {
    1: bool usePasswordSet;
    2: string email;
    3: string password;
    4: bool ignoreDuplication;
}

struct EmailConfirmationSession {
    1: EmailConfirmationType emailConfirmationType;
    2: string verifier;
    3: string targetEmail;
}

struct FriendChannelMatrix {
    1: string channelId;
    2: string representMid;
    3: i32 count;
    4: i32 point;
}

struct FriendChannelMatricesResponse {
    1: i64 expires;
    2: list<FriendChannelMatrix> matrices;
}

struct FriendRequest {
    1: string eMid;
    2: string mid;
    3: FriendRequestDirection direction;
    4: FriendRequestMethod method;
    5: string param;
    6: i64 timestamp;
    7: i64 seqId;
    10: string displayName;
    11: string picturePath;
    12: string pictureStatus;
}

struct FriendRequestsInfo {
    1: i32 totalIncomingCount;
    2: i32 totalOutgoingCount;
    3: list<FriendRequest> recentIncomings;
    4: list<FriendRequest> recentOutgoings;
    5: i32 totalIncomingLimit;
    6: i32 totalOutgoingLimit;
}

struct Geolocation {
    1: double longitude;
    2: double latitude;
}

struct NotificationTarget {
    1: string applicationType;
    2: string applicationVersion;
    3: string region;
}

struct GlobalEvent {
    1: string key;
    2: list<NotificationTarget> targets;
    3: i64 createdTime;
    4: i64 data;
    5: i32 maxDelay;
}

struct GroupPreference {
    1: string invitationTicket;
    2: i64 favoriteTimestamp;
}

struct Group {
    1: string id;
    2: i64 createdTime;
    10: string name;
    11: string pictureStatus;
    12: bool preventedJoinByTicket;
    13: GroupPreference groupPreference;
    20: list<Contact> members;
    21: Contact creator;
    22: list<Contact> invitee;
    31: bool notificationDisabled;
}

struct IdentityCredential {
    1: IdentityProvider provider;
    2: string identifier;
    3: string password;
}

struct LastReadMessageId {
    1: string mid;
    2: string lastReadMessageId;
}

struct LastReadMessageIds {
    1: string chatId;
    2: list<LastReadMessageId> lastReadMessageIds;
}

struct VerificationSessionData {
    1: string sessionId;
    2: VerificationMethod method;
    3: string callback;
    4: string normalizedPhone;
    5: string countryCode;
    6: string nationalSignificantNumber;
    7: list<VerificationMethod> availableVerificationMethods;
}

struct LoginResult {
    1: string authToken;
    2: string certificate;
    3: string verifier;
    4: string pinCode;
    5: LoginResultType type;
    6: i64 lastPrimaryBindTime;
    7: string displayMessage;
    8: VerificationSessionData sessionForSMSConfirm;
}

struct LoginRequest {
    1: i32 type;
    2: i32 identityProvider;
    3: string identifier;
    4: string password;
    5: bool keepLoggedIn;
    6: string accessLocation;
    7: string systemName;
    8: string certificate;
    9: string verifier;
    10: string secret;
    11: i32 e2eeVersion;
}

struct LoginSession {
    1: string tokenKey;
    3: i64 expirationTime;
    11: ApplicationType applicationType;
    12: string systemName;
    22: string accessLocation;
}

struct Message {
    1: string _from;
    2: string to;
    3: MIDType toType;
    4: string id;
    5: i64 createdTime;
    6: i64 deliveredTime;
    10: string text;
    11: Location location;
    14: bool hasContent;
    15: ContentType contentType;
    17: binary contentPreview;
    18: map<string, string> contentMetadata;
    19: i8 sessionId;
    20: list<binary> chunks;
    21: string relatedMessageId;
    22: MessageRelationType messageRelationType;
    23: i64 readCount;
    24: ServiceCode relatedMessageServiceCode;
}

struct SquareMessage {
    1: Message message;
    3: MIDType fromType;
    4: i64 squareMessageRevision;
}

struct SquareChatStatusWithoutMessage {
    1: i32 memberCount;
    2: i32 unreadMessageCount;
}

struct SquareChatStatus {
    3: SquareMessage lastMessage;
    4: string senderDisplayName;
    5: SquareChatStatusWithoutMessage otherStatus;
}

struct SquareChatMember {
    1: string squareMemberMid;
    2: string squareChatMid;
    3: i64 revision;
    4: SquareChatMembershipState membershipState;
    5: bool notificationForMessage;
}

struct MessageOperation {
    1: i64 revision;
    2: i64 createdTime;
    3: MessageOperationType type;
    4: i32 reqSeq;
    5: OpStatus status;
    10: string param1;
    11: string param2;
    12: string param3;
    20: Message message;
}

struct MessageOperations {
    1: list<MessageOperation> operations;
    2: bool endFlag;
}

struct MessageStoreResult {
    1: string requestId;
    2: list<string> messageIds;
}

struct MetaProfile {
    1: i64 createTime;
    2: string regionCode;
    3: map<RegistrationType, string> identities;
}

struct NotificationItem {
    1: string id;
    2: string _from;
    3: string to;
    4: string fromChannel;
    5: string toChannel;
    7: i64 revision;
    8: i64 createdTime;
    9: map<string, string> content;
}

struct NotificationFetchResult {
    1: NotificationItemFetchMode fetchMode;
    2: list<NotificationItem> itemList;
}

struct Operation {
    1: i64 revision;
    2: i64 createdTime;
    3: OpType type;
    4: i32 reqSeq;
    5: string checksum;
    7: OpStatus status;
    10: string param1;
    11: string param2;
    12: string param3;
    20: Message message;
}

struct PaymentReservation {
    1: string receiverMid;
    2: string productId;
    3: string language;
    4: string location;
    5: string currency;
    6: string price;
    7: PaymentType appStoreCode;
    8: string messageText;
    9: i32 messageTemplate;
    10: i64 packageId;
}

struct PaymentReservationResult {
    1: string orderId;
    2: string confirmUrl;
    3: map<string, string> extras;
}

struct Product {
    1: string productId;
    2: i64 packageId;
    3: i32 version;
    4: string authorName;
    5: bool onSale;
    6: i32 validDays;
    7: i32 saleType;
    8: string copyright;
    9: string title;
    10: string descriptionText;
    11: i64 shopOrderId;
    12: string fromMid;
    13: string toMid;
    14: i64 validUntil;
    15: i32 priceTier;
    16: string price;
    17: string currency;
    18: string currencySymbol;
    19: PaymentType paymentType;
    20: i64 createDate;
    21: bool ownFlag;
    22: ProductEventType eventType;
    23: string urlSchema;
    24: string downloadUrl;
    25: string buddyMid;
    26: i64 publishSince;
    27: bool newFlag;
    28: bool missionFlag;
    29: list<ProductCategory> categories;
    30: string missionButtonText;
    31: string missionShortDescription;
    32: string authorId;
    41: bool grantedByDefault;
    42: i32 displayOrder;
    43: bool availableForPresent;
    44: bool availableForMyself;
    51: bool hasAnimation;
    52: bool hasSound;
    53: bool recommendationsEnabled;
    54: StickerResourceType stickerResourceType;
}

struct ProductList {
    1: bool hasNext;
    4: i64 bannerSequence;
    5: ProductBannerLinkType bannerTargetType;
    6: string bannerTargetPath;
    7: list<Product> productList;
    8: string bannerLang;
}

struct StickerIdRange {
    1: i64 start;
    2: i32 size;
}

struct ProductSimple {
    1: string productId;
    2: i64 packageId;
    3: i32 version;
    4: bool onSale;
    5: i64 validUntil;
    10: list<StickerIdRange> stickerIdRanges;
    41: bool grantedByDefault;
    42: i32 displayOrder;
}

struct ProductSimpleList {
    1: bool hasNext;
    2: i32 reinvokeHour;
    3: i64 lastVersionSeq;
    4: list<ProductSimple> productList;
    5: i64 recentNewReleaseDate;
    6: i64 recentEventReleaseDate;
}

struct Profile {
    1: string mid;
    3: string userid;
    10: string phone;
    11: string email;
    12: string regionCode;
    20: string displayName;
    21: string phoneticName;
    22: string pictureStatus;
    23: string thumbnailUrl;
    24: string statusMessage;
    31: bool allowSearchByUserid;
    32: bool allowSearchByEmail;
    33: string picturePath;
    34: string musicProfile;
    35: string videoProfile;
}

struct ProximityMatchCandidateResult {
    1: list<Contact> users;
    2: list<Contact> buddies;
}

struct RegisterWithSnsIdResult {
    1: string authToken;
    2: bool userCreated;
}

struct RequestTokenResponse {
    1: string requestToken;
    2: string returnUrl;
}

struct Room {
    1: string mid;
    2: i64 createdTime;
    10: list<Contact> contacts;
    31: bool notificationDisabled;
    40: list<string> memberMids;
}

struct SuggestDictionary {
    1: string language;
    2: string name;
}

struct SuggestItemDictionaryIncrement {
    1: SuggestDictionaryIncrementStatus status;
    2: i64 revision;
    3: string scheme;
    4: binary data;
}

struct SuggestTagDictionaryIncrement {
    1: SuggestDictionaryIncrementStatus status;
    2: string language;
    3: i64 revision;
    4: string scheme;
    5: binary data;
}

struct SuggestDictionaryIncrements {
    1: SuggestItemDictionaryIncrement itemIncrement;
    2: list<SuggestTagDictionaryIncrement> tagIncrements;
}

enum SuggestDictionaryIncrementStatus {
    SUCCESS = 0;
    INVALID_REVISION = 1;
    TOO_LARGE_DATA = 2;
    SCHEME_CHANGED = 3;
    RETRY = 4;
    FAIL = 5;
    TOO_OLD_DATA = 6;
}

struct SuggestItemDictionaryRevision {
    1: i64 revision;
    2: string scheme;
}

struct SuggestTagDictionaryRevision {
    1: string language;
    2: i64 revision;
    3: string scheme;
}

struct SuggestDictionaryRevisions {
    1: SuggestItemDictionaryRevision itemRevision;
    2: list<SuggestTagDictionaryRevision> tagRevisions;
}

struct SuggestDictionarySettings {
    1: i64 revision;
    2: i64 newRevision;
    3: list<SuggestDictionary> dictionaries;
    4: list<string> preloadedDictionaries;
}

struct PhoneInfoForChannel {
    1: string mid;
    2: string normalizedPhoneNumber;
    3: bool allowedToSearchByPhoneNumber;
    4: bool allowedToReceiveMessageFromNonFriend;
    5: string region;
}

struct PhoneVerificationResult {
    1: VerificationResult verificationResult;
    2: AccountMigrationCheckType accountMigrationCheckType;
    3: bool recommendAddFriends;
}

struct PlaceSearchInfo {
    1: string name;
    2: string address;
    3: double latitude;
    4: double longitude;
}

struct RSAKey {
    1: string keynm;
    2: string nvalue;
    3: string evalue;
    4: string sessionKey;
}

struct SecurityCenterResult {
    1: string uri;
    2: string token;
    3: string cookiePath;
    4: bool skip;
}

struct SendBuddyMessageResult {
    1: string requestId;
    2: BuddyResultState state;
    3: string messageId;
    4: i32 eventNo;
    11: i64 receiverCount;
    12: i64 successCount;
    13: i64 failCount;
    14: i64 cancelCount;
    15: i64 blockCount;
    16: i64 unregisterCount;
    21: i64 timestamp;
    22: string message;
}

struct SetBuddyOnAirResult {
    1: string requestId;
    2: BuddyResultState state;
    3: i32 eventNo;
    11: i64 receiverCount;
    12: i64 successCount;
    13: i64 failCount;
    14: i64 cancelCount;
    15: i64 unregisterCount;
    21: i64 timestamp;
    22: string message;
}

struct Settings {
    10: bool notificationEnable;
    11: i64 notificationMuteExpiration;
    12: bool notificationNewMessage;
    13: bool notificationGroupInvitation;
    14: bool notificationShowMessage;
    15: bool notificationIncomingCall;
    16: string notificationSoundMessage;
    17: string notificationSoundGroup;
    18: bool notificationDisabledWithSub;
    20: bool privacySyncContacts;
    21: bool privacySearchByPhoneNumber;
    22: bool privacySearchByUserid;
    23: bool privacySearchByEmail;
    24: bool privacyAllowSecondaryDeviceLogin;
    25: bool privacyProfileImagePostToMyhome;
    26: bool privacyReceiveMessagesFromNotFriend;
    30: string contactMyTicket;
    40: IdentityProvider identityProvider;
    41: string identityIdentifier;
    42: map<SnsIdType, string> snsAccounts;
    43: bool phoneRegistration;
    44: EmailConfirmationStatus emailConfirmationStatus;
    50: string preferenceLocale;
    60: map<CustomMode, string> customModes;
    61: bool e2eeEnable;
    62: bool hitokotoBackupRequested;
    63: bool privacyProfileMusicPostToMyhome;
    65: bool privacyAllowNearby;
    66: i64 agreementNearbyTime;
    67: i64 agreementSquareTime;
    68: bool notificationMention;
    69: i64 botUseAgreementAcceptedAt;
}

struct SimpleChannelClient {
    1: string applicationType;
    2: string applicationVersion;
    3: string locale;
}

struct SimpleChannelContact {
    1: string mid;
    2: string displayName;
    3: string pictureStatus;
    4: string picturePath;
    5: string statusMessage;
}

struct SnsFriend {
    1: string snsUserId;
    2: string snsUserName;
    3: SnsIdType snsIdType;
}

struct SnsFriendContactRegistration {
    1: Contact contact;
    2: SnsIdType snsIdType;
    3: string snsUserId;
}

struct SnsFriendModification {
    1: ModificationType type;
    2: SnsFriend snsFriend;
}

struct SnsFriends {
    1: list<SnsFriend> snsFriends;
    2: bool hasMore;
}

struct SnsIdUserStatus {
    1: bool userExisting;
    2: bool phoneNumberRegistered;
    3: bool sameDevice;
}

struct SnsProfile {
    1: string snsUserId;
    2: string snsUserName;
    3: string email;
    4: string thumbnailUrl;
}

struct SystemConfiguration {
    1: string endpoint;
    2: string endpointSsl;
    3: string updateUrl;
    11: string c2dmAccount;
    12: string nniServer;
}

struct Ticket {
    1: string id;
    10: i64 expirationTime;
    21: i32 maxUseCount;
}

struct TMessageBox {
    1: string id;
    2: string channelId;
    5: i64 lastSeq;
    6: i64 unreadCount;
    7: i64 lastModifiedTime;
    8: i32 status;
    9: MIDType midType;
    10: list<Message> lastMessages;
}

struct TMessageBoxWrapUp {
    1: TMessageBox messageBox;
    2: string name;
    3: list<Contact> contacts;
    4: string pictureRevision;
}

struct TMessageBoxWrapUpResponse {
    1: list<TMessageBoxWrapUp> messageBoxWrapUpList;
    2: i32 totalSize;
}

struct TMessageReadRangeEntry {
    1: i64 startMessageId;
    2: i64 endMessageId;
    3: i64 startTime;
    4: i64 endTime;
}

struct TMessageReadRange {
    1: string chatId;
    2: map<string, list<TMessageReadRangeEntry>> ranges;
}

struct ChatRoomAnnouncementContents {
    1: i32 displayFields;
    2: string text;
    3: string link;
    4: string thumbnail;
}

struct ChatRoomAnnouncement {
    1: i64 announcementSeq;
    2: ChatRoomAnnouncementType type;
    3: ChatRoomAnnouncementContents contents;
    4: string creatorMid;
    5: i64 createdTime;
}

struct ErrorExtraInfo {
    1: PreconditionFailedExtraInfo preconditionFailedExtraInfo;
}

struct SyncRelations {
    1: bool syncAll;
    2: list<SyncParamContact> syncParamContact;
    3: list<SyncParamMid> syncParamMid;
}

struct SyncScope {
    1: bool syncProfile;
    2: bool syncSettings;
    3: bool syncSticker;
    4: bool syncThemeShop;
    10: SyncRelations contact;
    11: SyncRelations group;
    12: SyncRelations room;
    13: SyncRelations chat;
}

struct JoinSquareResponse {
    1: Square square;
    2: SquareAuthority squareAuthority;
    3: SquareStatus squareStatus;
    4: SquareMember squareMember;
    5: SquareFeatureSet squareFeatureSet;
    6: NoteStatus noteStatus;
}

struct JoinSquareRequest {
    2: string squareMid;
    3: SquareMember member;
}

struct JoinSquareChatResponse {
    1: SquareChat squareChat;
    2: SquareChatStatus squareChatStatus;
    3: SquareChatMember squareChatMember;
}

struct JoinSquareChatRequest {
    1: string squareChatMid;
}

struct SendMessageResponse {
    1: SquareMessage createdSquareMessage;
}

struct SendMessageRequest {
    1: i32 reqSeq;
    2: string squareChatMid;
    3: SquareMessage squareMessage;
}

struct MarkAsReadRequest {
    2: string squareChatMid;
    4: string messageId;
}

struct MarkAsReadResponse {
    
}

struct SubscriptionState {
    1: i64 subscriptionId;
    2: i64 ttlMillis;
}

struct ApproveSquareMembersResponse {
    1: list<SquareMember> approvedMembers;
    2: SquareStatus status;
}

struct ApproveSquareMembersRequest {
    2: string squareMid;
    3: list<string> requestedMemberMids;
}

struct CreateSquareChatResponse {
    1: SquareChat squareChat;
    2: SquareChatStatus squareChatStatus;
    3: SquareChatMember squareChatMember;
}

struct CreateSquareChatRequest {
    1: i32 reqSeq;
    2: SquareChat squareChat;
    3: list<string> squareMemberMids;
}

struct CreateSquareResponse {
    1: Square square;
    2: SquareMember creator;
    3: SquareAuthority authority;
    4: SquareStatus status;
}

struct CreateSquareRequest {
    1: i32 reqSeq;
    2: Square square;
    3: SquareMember creator;
}

struct DeleteSquareResponse {}

struct DeleteSquareRequest {
    2: string mid;
    3: i64 revision;
}

struct DestroyMessageResponse {}

struct DestroyMessageRequest {
    2: string squareChatMid;
    4: string messageId;
}

struct GetSquareChatMembersRequest {
    1: string squareChatMid;
    2: string continuationToken;
    3: i32 limit;
}

struct GetSquareChatMembersResponse {
    1: SquareMember squareChatMembers;
    2: string continuationToken;
}

struct GetSquareChatStatusRequest {
    2: string squareChatMid;
}

struct GetSquareChatStatusResponse {
    1: SquareChatStatus chatStatus;
}

struct GetSquareChatRequest {
    1: string squareChatMid;
}

struct GetSquareChatResponse {
    1: SquareChat squareChat;
    2: SquareChatMember squareChatMember;
    3: SquareChatStatus squareChatStatus;
}

struct GetSquareAuthorityRequest {
    1: string squareMid;
}

struct GetSquareAuthorityResponse {
    1: SquareAuthority authority;
}

struct GetJoinedSquaresRequest {
    2: string continuationToken;
    3: i32 limit;
}

struct GetJoinedSquaresResponse {
    1: list<Square> squares;
    2: map<string, SquareMember> members;
    3: map<string, SquareAuthority> authorities;
    4: map<string, SquareStatus> statuses;
    5: string continuationToken;
    6: map<string, NoteStatus> noteStatuses;
}

struct GetJoinableSquareChatsRequest {
    1: string squareMid;
    10: string continuationToken;
    11: i32 limit;
}

struct GetJoinableSquareChatsResponse {
    1: list<SquareChat> squareChats;
    2: string continuationToken;
    3: i32 totalSquareChatCount;
    4: map<string, SquareChatStatus> squareChatStatuses;
}

struct GetInvitationTicketUrlRequest {
    2: string mid;
}

struct GetInvitationTicketUrlResponse {
    1: string invitationURL;
}

struct LeaveSquareRequest {
    2: string squareMid;
}

struct LeaveSquareResponse {
    
}

struct LeaveSquareChatRequest {
    2: string squareChatMid;
    3: bool sayGoodbye;
    4: i64 squareChatMemberRevision;
}

struct LeaveSquareChatResponse {
    
}

struct SquareMemberSearchOption {
    1: SquareMembershipState membershipState;
    2: set<SquareMemberRole> memberRoles;
    3: string displayName;
    4: BooleanState ableToReceiveMessage;
    5: BooleanState ableToReceiveFriendRequest;
    6: string chatMidToExcludeMembers;
    7: bool includingMe;
}

struct SearchSquareMembersRequest {
    2: string squareMid;
    3: SquareMemberSearchOption searchOption;
    4: string continuationToken;
    5: i32 limit;
}

struct SearchSquareMembersResponse {
    1: list<SquareMember> members;
    2: i64 revision;
    3: string continuationToken;
    4: i32 totalCount;
}

struct FindSquareByInvitationTicketRequest {
    2: string invitationTicket;
}

struct FindSquareByInvitationTicketResponse {
    1: Square square;
    2: SquareMember myMembership
    3: SquareAuthority squareAuthority
    4: SquareStatus squareStatus;
}

struct SquareEventReceiveMessage {
    1: string squareChatMid;
    2: SquareMessage squareMessage;
}

struct SquareEventSendMessage {
    1: string squareChatMid;
    2: SquareMessage squareMessage;
    3: i32 reqSeq;
}

struct SquareEventNotifiedJoinSquareChat {
    1: string squareChatMid;
    2: SquareMember joinedMember;
}

struct SquareEventNotifiedInviteIntoSquareChat {
    1: string squareChatMid;
    2: list<SquareMember> invitees;
    3: SquareMember invitor;
    4: SquareMemberRelation invitorRelation;
}

struct SquareEventNotifiedLeaveSquareChat {
    1: string squareChatMid;
    2: string squareMemberMid;
    3: bool sayGoodbye;
    4: SquareMember squareMember;
}

struct SquareEventNotifiedDestroyMessage {
    1: string squareChatMid;
    3: string messageId;
}

struct SquareEventNotifiedMarkAsRead {
    1: string squareChatMid;
    2: string sMemberMid;
    4: string messageId;
}

struct SquareEventNotifiedUpdateSquareMemberProfile {
    1: string squareChatMid;
    2: SquareMember squareMember;
}

struct SquareEventNotifiedKickoutFromSquare {
    1: string squareChatMid;
    2: list<SquareMember> kickees;
}

struct SquareEventNotifiedShutdownSquare {
    1: string squareChatMid;
    2: Square square;
}

struct SquareEventNotifiedDeleteSquareChat {
    1: SquareChat squareChat;
}

struct SquareEventNotifiedUpdateSquareChatProfileName {
    1: string squareChatMid;
    2: SquareMember editor;
    3: string updatedChatName;
}

struct SquareEventNotifiedUpdateSquareChatProfileImage {
    1: string squareChatMid;
    2: SquareMember editor;
}

struct SquareEventNotifiedUpdateSquareChatStatus {
    1: string squareChatMid;
    2: SquareChatStatusWithoutMessage statusWithoutMessage;
}

struct SquareEventNotifiedUpdateSquareStatus {
    1: string squareMid;
    2: SquareStatus squareStatus;
}

struct SquareEventNotifiedCreateSquareMember {
    1: Square square;
    2: SquareAuthority squareAuthority;
    3: SquareStatus squareStatus;
    4: SquareMember squareMember;
    5: SquareFeatureSet squareFeatureSet;
}

struct SquareEventNotifiedCreateSquareChatMember {
    1: string squareChatMid;
    2: string squareMemberMid;
    3: SquareChatMember squareChatMember;
}

struct SquareEventNotifiedUpdateSquareMemberRelation {
    1: string squareMid;
    2: string myMemberMid;
    3: string targetSquareMemberMid;
    4: SquareMemberRelation squareMemberRelation;
}

struct SquareEventNotifiedUpdateSquare {
    1: string squareMid;
    2: Square square;
}

struct SquareEventNotifiedUpdateSquareMember {
    1: string squareMid;
    2: string squareMemberMid;
    3: SquareMember squareMember;
}

struct SquareEventNotifiedUpdateSquareChat {
    1: string squareMid;
    2: string squareChatMid;
    3: SquareChat squareChat;
}

struct SquareEventNotificationJoinRequest {
    1: string squareMid;
    2: string squareName;
    3: string requestMemberName;
    4: string profileImageObsHash;
}

struct SquareEventNotificationMemberUpdate {
    1: string squareMid;
    2: string squareName;
    3: string profileImageObsHash;
}

struct SquareEventNotificationSquareDelete {
    1: string squareMid;
    2: string squareName;
    3: string profileImageObsHash;
}

struct SquareEventNotificationSquareChatDelete {
    1: string squareChatMid;
    2: string squareChatName;
    3: string profileImageObsHash;
}

struct SquareEventNotificationMessage {
   1: string squareChatMid;
   2: SquareMessage squareMessage
   3: string senderDisplayName;
   4: i32 unreadCount;
   5: bool requiredToFetchChatEvents;
}

struct SquareEventNotifiedUpdateSquareChatMember {
    1: string squareChatMid;
    2: string squareMemberMid;
    3: SquareChatMember squareChatMember;
}

struct SquareEventNotifiedUpdateSquareAuthority {
    1: string squareMid;
    2: SquareAuthority squareAuthority;
}

struct SquareEventNotifiedUpdateSquareFeatureSet {
    1: SquareFeatureSet squareFeatureSet;
}

struct SquareEventPayload {
    1: SquareEventReceiveMessage receiveMessage;
    2: SquareEventSendMessage sendMessage;
    3: SquareEventNotifiedJoinSquareChat notifiedJoinSquareChat;
    4: SquareEventNotifiedInviteIntoSquareChat notifiedInviteIntoSquareChat;
    5: SquareEventNotifiedLeaveSquareChat notifiedLeaveSquareChat;
    6: SquareEventNotifiedDestroyMessage notifiedDestroyMessage;
    7: SquareEventNotifiedMarkAsRead notifiedMarkAsRead;
    8: SquareEventNotifiedUpdateSquareMemberProfile notifiedUpdateSquareMemberProfile;
    20: SquareEventNotifiedKickoutFromSquare notifiedKickoutFromSquare;
    19: SquareEventNotifiedShutdownSquare notifiedShutdownSquare;
    21: SquareEventNotifiedDeleteSquareChat notifiedDeleteSquareChat;
    31: SquareEventNotifiedUpdateSquareChatProfileName notifiedUpdateSquareChatProfileName;
    32: SquareEventNotifiedUpdateSquareChatProfileImage notifiedUpdateSquareChatProfileImage;
    14: SquareEventNotifiedUpdateSquareStatus notifiedUpdateSquareStatus;
    15: SquareEventNotifiedUpdateSquareChatStatus notifiedUpdateSquareChatStatus;
    16: SquareEventNotifiedCreateSquareMember notifiedCreateSquareMember;
    17: SquareEventNotifiedCreateSquareChatMember notifiedCreateSquareChatMember;
    18: SquareEventNotifiedUpdateSquareMemberRelation notifiedUpdateSquareMemberRelation;
    9: SquareEventNotifiedUpdateSquare notifiedUpdateSquare;
    10: SquareEventNotifiedUpdateSquareMember notifiedUpdateSquareMember;
    11: SquareEventNotifiedUpdateSquareChat notifiedUpdateSquareChat;
    22: SquareEventNotificationJoinRequest notificationJoinRequest;
    23: SquareEventNotificationMemberUpdate notificationJoined;
    24: SquareEventNotificationMemberUpdate notificationPromoteCoadmin;
    25: SquareEventNotificationMemberUpdate notificationPromoteAdmin;
    26: SquareEventNotificationMemberUpdate notificationDemoteMember;
    27: SquareEventNotificationMemberUpdate notificationKickedOut;
    28: SquareEventNotificationSquareDelete notificationSquareDelete;
    29: SquareEventNotificationSquareChatDelete notificationSquareChatDelete;
    30: SquareEventNotificationMessage notificationMessage;
    12: SquareEventNotifiedUpdateSquareChatMember notifiedUpdateSquareChatMember;
    13: SquareEventNotifiedUpdateSquareAuthority notifiedUpdateSquareAuthority;
    33: SquareEventNotifiedUpdateSquareFeatureSet notifiedUpdateSquareFeatureSet;
}

struct SquareEvent {
    2: i64 createdTime;
    3: SquareEventType type;
    4: SquareEventPayload payload;
    5: string syncToken;
    6: SquareEventStatus eventStatus;
}

struct FetchMyEventsRequest {
    1: i64 subscriptionId;
    2: string syncToken;
    3: i32 limit;
    4: string continuationToken;
}

struct FetchMyEventsResponse {
    1: SubscriptionState subscription;
    2: list<SquareEvent> events;
    3: string syncToken;
    4: string continuationToken;
}

struct FetchSquareChatEventsRequest {
    1: i64 subscriptionId;
    2: string squareChatMid;
    3: string syncToken;
    4: i32 limit;
    5: FetchDirection direction;
}

struct FetchSquareChatEventsResponse {
    1: SubscriptionState subscription;
    2: list<SquareEvent> events;
    3: string syncToken;
    4: string continuationToken;
}

struct InviteToSquareRequest {
    2: string squareMid;
    3: list<string> invitees;
    4: string squareChatMid;
}

struct InviteToSquareResponse {
    
}

struct InviteToSquareChatRequest {
    1: list<string> inviteeMids;
    2: string squareChatMid;
}

struct InviteToSquareChatResponse {
    1: list<string> inviteeMids;
}

struct GetSquareMemberRequest {
    1: string squareMemberMid;
}

struct GetSquareMemberResponse {
    1: SquareMember squareMember;
    2: SquareMemberRelation relation;
    3: string oneOnOneChatMid;
}

struct GetSquareMembersRequest {
    2: set<string> mids;
}

struct GetSquareMembersResponse {
    1: SquareMember members;
}

struct GetSquareMemberRelationsRequest {
    2: SquareMemberRelationState state;
    3: string continuationToken;
    4: i32 limit;
}

struct GetSquareMemberRelationsResponse {
    1: list<SquareMember> squareMembers;
    2: map<string, SquareMemberRelation> relations;
    3: string continuationToken;
}

struct GetSquareMemberRelationRequest {
    2: string squareMid;
    3: string targetSquareMemberMid;
}

struct GetSquareMemberRelationResponse {
    1: string squareMid;
    2: string targetSquareMemberMid;
    3: SquareMemberRelation relation;
}

struct Category {
    1: i32 id;
    2: string name;
}

struct GetSquareCategoriesRequest {
    
}

struct GetSquareCategoriesResponse {
    1: list<Category> categoryList;
}

struct UpdateSquareRequest {
    2: set<SquareAttribute> updatedAttrs;
    3: Square square;
}

struct UpdateSquareResponse {
    1: set<SquareAttribute> updatedAttrs;
    2: Square square;
}

struct SearchSquaresRequest {
    2: string query;
    3: string continuationToken;
    4: i32 limit;
}

struct SearchSquaresResponse {
    1: list<Square> squares;
    2: map<string, SquareStatus> squareStatuses;
    3: map<string, SquareMember> myMemberships;
    4: string continuationToken;
    5: map<string, NoteStatus> noteStatuses;
}

struct GetSquareFeatureSetRequest {
    2: string squareMid;
}

struct GetSquareFeatureSetResponse {
    1: SquareFeatureSet squareFeatureSet;
}

struct UpdateSquareFeatureSetRequest {
    2: set<SquareFeatureSetAttribute> updateAttributes;
    3: SquareFeatureSet squareFeatureSet;
}

struct UpdateSquareFeatureSetResponse {
    1: set<SquareFeatureSetAttribute> updateAttributes;
    2: SquareFeatureSet squareFeatureSet;
}

struct UpdateSquareMemberRequest {
    2: set<SquareMemberAttribute> updatedAttrs;
    3: set<SquarePreferenceAttribute> updatedPreferenceAttrs;
    4: SquareMember squareMember;
}

struct UpdateSquareMemberResponse {
    1: set<SquareMemberAttribute> updatedAttrs;
    2: SquareMember squareMember;
    3: set<SquarePreferenceAttribute> updatedPreferenceAttrs;
}

struct UpdateSquareMembersRequest {
    2: set<SquareMemberAttribute> updatedAttrs;
    3: list<SquareMember> members;
}

struct UpdateSquareMembersResponse {
    1: set<SquareMemberAttribute> updatedAttrs;
    2: SquareMember editor;
    3: map<string, SquareMember> members;
}

struct RejectSquareMembersRequest {
    2: string squareMid;
    3: list<string> requestedMemberMids;
}

struct RejectSquareMembersResponse {
    1: list<SquareMember> rejectedMembers;
    2: SquareStatus status;
}

struct RemoveSubscriptionsRequest {
    2: list<i64> unsubscriptions;
}

struct RemoveSubscriptionsResponse {
    
}

struct RefreshSubscriptionsRequest {
    2: list<i64> subscriptions;
}

struct RefreshSubscriptionsResponse {
    1: i64 ttlMillis;
    2: map<i64, SubscriptionState> subscriptionStates;
}

struct UpdateSquareChatRequest {
    2: set<SquareChatAttribute> updatedAttrs;
    3: SquareChat squareChat;
}

struct UpdateSquareChatResponse {
    1: set<SquareChatAttribute> updatedAttrs;
    2: SquareChat squareChat;
}

struct DeleteSquareChatRequest {
    2: string squareChatMid;
    3: i64 revision;
}

struct DeleteSquareChatResponse {
    
}

struct UpdateSquareChatMemberRequest {
    2: set<SquareChatMemberAttribute> updatedAttrs;
    3: SquareChatMember chatMember;
}

struct UpdateSquareChatMemberResponse {
    1: SquareChatMember updatedChatMember;
}

struct UpdateSquareAuthorityRequest {
    2: set<SquareAuthorityAttribute> updateAttributes;
    3: SquareAuthority authority;
}

struct UpdateSquareAuthorityResponse {
    1: set<SquareAuthorityAttribute> updatdAttributes;
    2: SquareAuthority authority;
}

struct UpdateSquareMemberRelationRequest {
    2: string squareMid;
    3: string targetSquareMemberMid;
    4: set<SquareMemberRelationAttribute> updatedAttrs;
    5: SquareMemberRelation relation;
}

struct UpdateSquareMemberRelationResponse {
    1: string squareMid;
    2: string targetSquareMemberMid;
    3: set<SquareMemberRelationAttribute> updatedAttrs;
    4: SquareMemberRelation relation;
}

struct ReportSquareRequest {
    2: string squareMid;
    3: ReportType reportType;
    4: string otherReason;
}

struct ReportSquareResponse {
    
}

struct ReportSquareChatRequest {
    2: string squareMid;
    3: string squareChatMid;
    5: ReportType reportType;
    6: string otherReason;
}

struct ReportSquareChatResponse {
    
}

struct ReportSquareMessageRequest {
    2: string squareMid;
    3: string squareChatMid;
    4: string squareMessageId;
    5: ReportType reportType;
    6: string otherReason;
}

struct ReportSquareMessageResponse {
    
}

struct ReportSquareMemberRequest {
    2: string squareMemberMid;
    3: ReportType reportType;
    4: string otherReason;
    5: string squareChatMid;
}

struct ReportSquareMemberResponse {
    
}

struct GetSquareRequest {
    2: string mid;
}

struct GetSquareResponse {
    1: Square square;
    2: SquareMember myMembership;
    3: SquareAuthority squareAuthority;
    4: SquareStatus squareStatus;
    5: SquareFeatureSet squareFeatureSet;
    6: NoteStatus noteStatus;
}

struct GetSquareStatusRequest {
    2: string squareMid;
}

struct GetSquareStatusResponse {
    1: SquareStatus squareStatus;
}

struct GetNoteStatusRequest {
    2: string squareMid;
}

struct GetNoteStatusResponse {
    1: string squareMid;
    2: NoteStatus status;
}

struct CreateSquareChatAnnouncementRequest {
    1: i32 reqSeq;
    2: string squareChatMid;
    3: SquareChatAnnouncement squareChatAnnouncement;
}

struct CreateSquareChatAnnouncementResponse {
    1: SquareChatAnnouncement announcement;
}

struct DeleteSquareChatAnnouncementRequest {
    2: string squareChatMid;
    3: i64 announcementSeq;
}

struct DeleteSquareChatAnnouncementResponse {
    
}

struct GetSquareChatAnnouncementsRequest {
    2: string squareChatMid;
}

struct GetSquareChatAnnouncementsResponse {
    1: list<SquareChatAnnouncement> announcements;
}

struct GetJoinedSquareChatsRequest {
    2: string continuationToken;
    3: i32 limit;
}

struct GetJoinedSquareChatsResponse {
    1: list<SquareChat> chats;
    2: map<string, SquareChatMember> chatMembers;
    3: map<string, SquareChatStatus> statuses;
    4: string continuationToken;
}

exception TalkException {
    1: ErrorCode code;
    2: string reason;
    3: map<string, string> parameterMap;
}

exception ShouldSyncException {
    1: i64 syncOpRevision;
    2: SyncScope syncScope;
    3: SyncTriggerReason syncReason;
    4: string message;
}

exception PointException {
    1: PointErrorCode code;
    2: string reason;
    3: map<string, string> extra;
}

exception ChannelException {
    1: ChannelErrorCode code;
    2: string reason;
    3: map<string, string> parameterMap;
}

exception SquareException {
    1: SQErrorCode errorCode;
    2: ErrorExtraInfo errorExtraInfo;
    3: string reason;
}

exception UniversalNotificationServiceException {
    1: UniversalNotificationServiceErrorCode code;
    2: string reason;
    3: map<string, string> parameterMap;
}

struct UpdateBuddyProfileResult {
    1: string requestId;
    2: BuddyResultState state;
    3: i32 eventNo;
    11: i64 receiverCount;
    12: i64 successCount;
    13: i64 failCount;
    14: i64 cancelCount;
    15: i64 unregisterCount;
    21: i64 timestamp;
    22: string message;
}

struct UserAuthStatus {
    1: bool phoneNumberRegistered;
    2: list<SnsIdType> registeredSnsIdTypes;
}

struct WapInvitation {
    1: WapInvitationType type;
    10: string inviteeEmail;
    11: string inviterMid;
    12: string roomMid;
}

struct GroupCall {
    1: bool online;
    2: string chatMid;
    3: string hostMids;
    4: list<string> memberMids;
    5: i64 started;
    6: GroupCallMediaType mediaType;
}

struct GroupCallRoute {
    1: string token;
    2: CallHost cscf;
    3: CallHost mix;
}

service AccountSupervisorService {
    RSAKey getRSAKey() throws(1: TalkException e);

    void notifyEmailConfirmationResult(
        2: map<string, string> parameterMap) throws(1: TalkException e);

    string registerVirtualAccount(
        2: string locale,
        3: string encryptedVirtualUserId,
        4: string encryptedPassword) throws(1: TalkException e);

    void requestVirtualAccountPasswordChange(
        2: string virtualMid,
        3: string encryptedVirtualUserId,
        4: string encryptedOldPassword,
        5: string encryptedNewPassword) throws(1: TalkException e);

    void requestVirtualAccountPasswordSet(
        2: string virtualMid,
        3: string encryptedVirtualUserId,
        4: string encryptedNewPassword) throws(1: TalkException e);

    void unregisterVirtualAccount(
        2: string virtualMid) throws(1: TalkException e);
}

service SpotService {

    SpotPhoneNumberResponse lookupByPhoneNumber(
        2: string countryAreaCode,
        3: string phoneNumber) throws (1: TalkException e);

    SpotNearbyResponse lookupNearby(
        2: Location location,
        3: SpotCategory category,
        4: string query,
        5: string countryAreaCode) throws (1: TalkException e);

}

service BotService {
    void notifyLeaveGroup(
        1: string groupMid) throws (1: TalkException e);

    void notifyLeaveRoom(
        1: string roomMid) throws (1: TalkException e);
    
    BotUseInfo getBotUseInfo(
        2: string botMid,
    ) throws (1: TalkException e)
    
    void sendChatCheckedByWatermark(
        1: i32 seq,
        2: string mid,
        3: i64 watermark,
        4: i8 sessionId,
    ) throws (1: TalkException e);

}

service AgeCheckService {

    UserAgeType checkUserAge(
        2: CarrierCode carrier,
        3: string sessionId,
        4: string verifier,
        5: i32 standardAge) throws(1: TalkException e);

    AgeCheckDocomoResult checkUserAgeWithDocomo(
        2: string openIdRedirectUrl,
        3: i32 standardAge,
        4: string verifier) throws(1: TalkException e);

    string retrieveOpenIdAuthUrlWithDocomo() throws(1: TalkException e);

    AgeCheckRequestResult retrieveRequestToken(
        2: CarrierCode carrier) throws(1: TalkException e);

}

service BuddyManagementService {

    void addBuddyMember(
        1: string requestId,
        2: string userMid) throws(1: TalkException e);

    void addBuddyMembers(
        1: string requestId,
        2: list<string> userMids) throws(1: TalkException e);

    void blockBuddyMember(
        1: string requestId,
        2: string mid) throws(1: TalkException e);

    list<SendBuddyMessageResult> commitSendMessagesToAll(
        1: list<string> requestIdList) throws(1: TalkException e);

    list<SendBuddyMessageResult> commitSendMessagesToMids(
        1: list<string> requestIdList,
        2: list<string> mids) throws(1: TalkException e);

    bool containsBuddyMember(
        1: string requestId,
        2: string userMid) throws(1: TalkException e);

    binary downloadMessageContent(
        1: string requestId,
        2: string messageId) throws(1: TalkException e);

    binary downloadMessageContentPreview(
        1: string requestId,
        2: string messageId) throws(1: TalkException e);

    binary downloadProfileImage(
        1: string requestId) throws(1: TalkException e);

    binary downloadProfileImagePreview(
        1: string requestId) throws(1: TalkException e);

    i64 getActiveMemberCountByBuddyMid(
        2: string buddyMid) throws(1: TalkException e);

    list<string> getActiveMemberMidsByBuddyMid(
        2: string buddyMid) throws(1: TalkException e);

    list<string> getAllBuddyMembers() throws(1: TalkException e);

    list<string> getBlockedBuddyMembers() throws(1: TalkException e);

    i64 getBlockerCountByBuddyMid(
        2: string buddyMid) throws(1: TalkException e);

    BuddyDetail getBuddyDetailByMid(
        2: string buddyMid) throws(1: TalkException e);

    BuddyProfile getBuddyProfile() throws(1: TalkException e);

    Ticket getContactTicket() throws(1: TalkException e);

    i64 getMemberCountByBuddyMid(
        2: string buddyMid) throws(1: TalkException e);

    SendBuddyMessageResult getSendBuddyMessageResult(
        1: string sendBuddyMessageRequestId) throws(1: TalkException e);

    SetBuddyOnAirResult getSetBuddyOnAirResult(
        1: string setBuddyOnAirRequestId) throws(1: TalkException e);

    UpdateBuddyProfileResult getUpdateBuddyProfileResult(
        1: string updateBuddyProfileRequestId) throws(1: TalkException e);

    bool isBuddyOnAirByMid(
        2: string buddyMid) throws(1: TalkException e);

    string linkAndSendBuddyContentMessageToAllAsync(
        1: string requestId,
        2: Message msg,
        3: string sourceContentId) throws(1: TalkException e);

    SendBuddyMessageResult linkAndSendBuddyContentMessageToMids(
        1: string requestId,
        2: Message msg,
        3: string sourceContentId,
        4: list<string> mids) throws(1: TalkException e);

    void notifyBuddyBlocked(
        1: string buddyMid,
        2: string blockerMid) throws(1: TalkException e);

    void notifyBuddyUnblocked(
        1: string buddyMid,
        2: string blockerMid) throws(1: TalkException e);

    string registerBuddy(
        2: string buddyId,
        3: string searchId,
        4: string displayName,
        5: string statusMeessage,
        6: binary picture,
        7: map<string, string> settings) throws(1: TalkException e);

    string registerBuddyAdmin(
        2: string buddyId,
        3: string searchId,
        4: string displayName,
        5: string statusMessage,
        6: binary picture) throws(1: TalkException e);

    string reissueContactTicket(
        3: i64 expirationTime,
        4: i32 maxUseCount) throws(1: TalkException e);

    void removeBuddyMember(
        1: string requestId,
        2: string userMid) throws(1: TalkException e);

    void removeBuddyMembers(
        1: string requestId,
        2: list<string> userMids) throws(1: TalkException e);

    SendBuddyMessageResult sendBuddyContentMessageToAll(
        1: string requestId,
        2: Message msg,
        3: binary content) throws(1: TalkException e);

    string sendBuddyContentMessageToAllAsync(
        1: string requestId,
        2: Message msg,
        3: binary content) throws(1: TalkException e);

    SendBuddyMessageResult sendBuddyContentMessageToMids(
        1: string requestId,
        2: Message msg,
        3: binary content,
        4: list<string> mids) throws(1: TalkException e);

    string sendBuddyContentMessageToMidsAsync(
        1: string requestId,
        2: Message msg,
        3: binary content,
        4: list<string> mids) throws(1: TalkException e);

    SendBuddyMessageResult sendBuddyMessageToAll(
        1: string requestId,
        2: Message msg) throws(1: TalkException e);

    string sendBuddyMessageToAllAsync(
        1: string requestId,
        2: Message msg) throws(1: TalkException e);

    SendBuddyMessageResult sendBuddyMessageToMids(
        1: string requestId,
        2: Message msg,
        3: list<string> mids) throws(1: TalkException e);

    string sendBuddyMessageToMidsAsync(
        1: string requestId,
        2: Message msg,
        3: list<string> mids) throws(1: TalkException e);

    void sendIndividualEventToAllAsync(
        1: string requestId,
        2: string buddyMid,
        3: NotificationStatus notificationStatus) throws(1: TalkException e);

    SetBuddyOnAirResult setBuddyOnAir(
        1: string requestId,
        2: bool onAir) throws(1: TalkException e);

    string setBuddyOnAirAsync(
        1: string requestId,
        2: bool onAir) throws(1: TalkException e);

    SendBuddyMessageResult storeMessage(
        1: string requestId,
        2: BuddyMessageRequest messageRequest) throws(1: TalkException e);

    void unblockBuddyMember(
        1: string requestId,
        2: string mid) throws(1: TalkException e);

    void unregisterBuddy(
        1: string requestId) throws(1: TalkException e);

    void unregisterBuddyAdmin(
        1: string requestId) throws(1: TalkException e);

    void updateBuddyAdminProfileAttribute(
        1: string requestId,
        2: map<string, string> attributes) throws(1: TalkException e);

    void updateBuddyAdminProfileImage(
        1: string requestId,
        2: binary picture) throws(1: TalkException e);

    UpdateBuddyProfileResult updateBuddyProfileAttributes(
        1: string requestId,
        2: map<string, string> attributes) throws(1: TalkException e);

    string updateBuddyProfileAttributesAsync(
        1: string requestId,
        2: map<string, string> attributes) throws(1: TalkException e);

    UpdateBuddyProfileResult updateBuddyProfileImage(
        1: string requestId,
        2: binary image) throws(1: TalkException e);

    string updateBuddyProfileImageAsync(
        1: string requestId,
        2: binary image) throws(1: TalkException e);

    void updateBuddySearchId(
        1: string requestId,
        2: string searchId) throws(1: TalkException e);

    void updateBuddySettings(
        2: map<string, string> settings) throws(1: TalkException e);

    string uploadBuddyContent(
        2: ContentType contentType,
        3: binary content) throws(1: TalkException e);

}

service BuddyService {

    list<BuddySearchResult> findBuddyContactsByQuery(
        2: string language,
        3: string country,
        4: string query,
        5: i32 fromIndex,
        6: i32 count,
        7: BuddySearchRequestSource requestSource) throws(1: TalkException e);

    list<Contact> getBuddyContacts(
        2: string language,
        3: string country,
        4: string classification,
        5: i32 fromIndex,
        6: i32 count) throws(1: TalkException e);

    BuddyDetail getBuddyDetail(
        4: string buddyMid) throws(1: TalkException e);

    BuddyOnAir getBuddyOnAir(
        4: string buddyMid) throws(1: TalkException e);

    list<string> getCountriesHavingBuddy() throws(1: TalkException e);

    map<string, i64> getNewlyReleasedBuddyIds(
        3: string country) throws(1: TalkException e);

    BuddyBanner getPopularBuddyBanner(
        2: string language,
        3: string country,
        4: ApplicationType applicationType,
        5: string resourceSpecification) throws(1: TalkException e);

    list<BuddyList> getPopularBuddyLists(
        2: string language,
        3: string country) throws(1: TalkException e);

    list<Contact> getPromotedBuddyContacts(
        2: string language,
        3: string country) throws(1: TalkException e);

}

service ChannelApplicationProvidedService {

    i64 activeBuddySubscriberCount() throws(1: TalkException e);

    void addOperationForChannel(
        1: OpType opType,
        2: string param1,
        3: string param2,
        4: string param3) throws(1: TalkException e);

    i64 displayBuddySubscriberCount() throws(1: TalkException e);

    Contact findContactByUseridWithoutAbuseBlockForChannel(
        2: string userid) throws(1: TalkException e);

    list<string> getAllContactIdsForChannel() throws(1: TalkException e);

    list<CompactContact> getCompactContacts(
        2: i64 lastModifiedTimestamp) throws(1: TalkException e);

    list<Contact> getContactsForChannel(
        2: list<string> ids) throws(1: TalkException e);

    string getDisplayName(
        2: string mid) throws(1: TalkException e);

    list<string> getFavoriteMidsForChannel() throws(1: TalkException e);

    list<string> getFriendMids() throws(1: TalkException e);

    list<string> getGroupMemberMids(
        1: string groupId) throws(1: TalkException e);

    list<Group> getGroupsForChannel(
        1: list<string> groupIds) throws(1: TalkException e);

    IdentityCredential getIdentityCredential() throws(1: TalkException e);

    list<string> getJoinedGroupIdsForChannel() throws(1: TalkException e);

    MetaProfile getMetaProfile() throws(1: TalkException e);

    string getMid() throws(1: TalkException e);

    SimpleChannelClient getPrimaryClientForChannel() throws(1: TalkException e);

    Profile getProfileForChannel() throws(1: TalkException e);

    list<SimpleChannelContact> getSimpleChannelContacts(
        1: list<string> ids) throws(1: TalkException e);

    string getUserCountryForBilling(
        2: string country,
        3: string remoteIp) throws(1: TalkException e);

    i64 getUserCreateTime() throws(1: TalkException e);

    map<RegistrationType, string> getUserIdentities() throws(1: TalkException e);

    string getUserLanguage() throws(1: TalkException e);

    list<string> getUserMidsWhoAddedMe() throws(1: TalkException e);

    bool isGroupMember(
        1: string groupId) throws(1: TalkException e);

    bool isInContact(
        2: string mid) throws(1: TalkException e);

    string registerChannelCP(
        2: string cpId,
        3: string registerPassword) throws(1: TalkException e);

    void removeNotificationStatus(
        2: NotificationStatus notificationStatus) throws(1: TalkException e);

    Message sendMessageForChannel(
        2: Message message) throws(1: TalkException e);

    void sendPinCodeOperation(
        1: string verifier) throws(1: TalkException e);

    void updateProfileAttributeForChannel(
        2: ProfileAttribute profileAttribute,
        3: string value) throws(1: TalkException e);

}

service ChannelService {

    OTPResult issueOTP(
        2: string channelId) throws (1: ChannelException e);

    ChannelToken approveChannelAndIssueChannelToken(
        1: string channelId) throws(1: ChannelException e);

    string approveChannelAndIssueRequestToken(
        1: string channelId,
        2: string otpId) throws(1: ChannelException e);

    NotificationFetchResult fetchNotificationItems(
        2: i64 localRev) throws(1: ChannelException e);

    ApprovedChannelInfos getApprovedChannels(
        2: i64 lastSynced,
        3: string locale) throws(1: ChannelException e);

    ChannelInfo getChannelInfo(
        2: string channelId,
        3: string locale) throws(1: ChannelException e);

    ChannelNotificationSetting getChannelNotificationSetting(
        1: string channelId,
        2: string locale) throws(1: ChannelException e);

    list<ChannelNotificationSetting> getChannelNotificationSettings(
        1: string locale) throws(1: ChannelException e);

    ChannelInfos getChannels(
        2: i64 lastSynced,
        3: string locale) throws(1: ChannelException e);

    ChannelDomains getDomains(
        2: i64 lastSynced) throws(1: ChannelException e);

    FriendChannelMatricesResponse getFriendChannelMatrices(
        1: list<string> channelIds) throws(1: ChannelException e);

    bool updateChannelSettings(
        1: ChannelSettings channelSettings) throws (1: ChannelException e)

    ChannelDomains getCommonDomains(
        1: i64 lastSynced) throws (1: ChannelException e);

    i32 getNotificationBadgeCount(
        2: i64 localRev) throws(1: ChannelException e);

    ChannelToken issueChannelToken(
        1: string channelId) throws(1: ChannelException e);

    string issueRequestToken(
        1: string channelId,
        2: string otpId) throws(1: ChannelException e);

    RequestTokenResponse issueRequestTokenWithAuthScheme(
        1: string channelId,
        2: string otpId,
        3: list<string> authScheme,
        4: string returnUrl) throws(1: ChannelException e);

    string issueRequestTokenForAutoLogin(
        2: string channelId,
        3: string otpId,
        4: string redirectUrl) throws (1: ChannelException e);

    list<string> getUpdatedChannelIds(
        1: list<ChannelIdWithLastUpdated> channelIds) throws (1: ChannelException e);    

    string reserveCoinUse(
        2: CoinUseReservation request,
        3: string locale) throws(1: ChannelException e);

    void revokeChannel(
        1: string channelId) throws(1: ChannelException e);

    ChannelSyncDatas syncChannelData(
        2: i64 lastSynced,
        3: string locale) throws(1: ChannelException e);

    void updateChannelNotificationSetting(
        1: list<ChannelNotificationSetting> setting) throws(1: ChannelException e);

}

service MessageService {

    MessageOperations fetchMessageOperations(
        2: i64 localRevision,
        3: i64 lastOpTimestamp,
        4: i32 count) throws(1: TalkException e);

    LastReadMessageIds getLastReadMessageIds(
        2: string chatId) throws(1: TalkException e);

    list<LastReadMessageIds> multiGetLastReadMessageIds(
        2: list<string> chatIds) throws(1: TalkException e);

}

service ShopService {

    void buyCoinProduct(
        2: PaymentReservation paymentReservation) throws(1: TalkException e);

    void buyFreeProduct(
        2: string receiverMid,
        3: string productId,
        4: i32 messageTemplate,
        5: string language,
        6: string country,
        7: i64 packageId) throws(1: TalkException e);

    void buyMustbuyProduct(
        2: string receiverMid,
        3: string productId,
        4: i32 messageTemplate,
        5: string language,
        6: string country,
        7: i64 packageId,
        8: string serialNumber) throws(1: TalkException e);

    void checkCanReceivePresent(
        2: string recipientMid,
        3: i64 packageId,
        4: string language,
        5: string country) throws(1: TalkException e);

    ProductList getActivePurchases(
        2: i64 start,
        3: i32 size,
        4: string language,
        5: string country) throws(1: TalkException e);

    ProductSimpleList getActivePurchaseVersions(
        2: i64 start,
        3: i32 size,
        4: string language,
        5: string country) throws(1: TalkException e);

    list<CoinProductItem> getCoinProducts(
        2: PaymentType appStoreCode,
        3: string country,
        4: string language) throws(1: TalkException e);

    list<CoinProductItem> getCoinProductsByPgCode(
        2: PaymentType appStoreCode,
        3: PaymentPgType pgCode,
        4: string country,
        5: string language) throws(1: TalkException e);

    CoinHistoryResult getCoinPurchaseHistory(
        2: CoinHistoryCondition request) throws(1: TalkException e);

    CoinHistoryResult getCoinUseAndRefundHistory(
        2: CoinHistoryCondition request) throws(1: TalkException e);

    ProductList getDownloads(
        2: i64 start,
        3: i32 size,
        4: string language,
        5: string country) throws(1: TalkException e);

    ProductList getEventPackages(
        2: i64 start,
        3: i32 size,
        4: string language,
        5: string country) throws(1: TalkException e);

    ProductList getNewlyReleasedPackages(
        2: i64 start,
        3: i32 size,
        4: string language,
        5: string country) throws(1: TalkException e);

    ProductList getPopularPackages(
        2: i64 start,
        3: i32 size,
        4: string language,
        5: string country) throws(1: TalkException e);

    ProductList getPresentsReceived(
        2: i64 start,
        3: i32 size,
        4: string language,
        5: string country) throws(1: TalkException e);

    ProductList getPresentsSent(
        2: i64 start,
        3: i32 size,
        4: string language,
        5: string country) throws(1: TalkException e);

    Product getProduct(
        2: i64 packageID,
        3: string language,
        4: string country) throws(1: TalkException e);

    ProductList getProductList(
        2: list<string> productIdList,
        3: string language,
        4: string country) throws(1: TalkException e);

    ProductList getProductListWithCarrier(
        2: list<string> productIdList,
        3: string language,
        4: string country,
        5: string carrierCode) throws(1: TalkException e);

    Product getProductWithCarrier(
        2: i64 packageID,
        3: string language,
        4: string country,
        5: string carrierCode) throws(1: TalkException e);

    ProductList getPurchaseHistory(
        2: i64 start,
        3: i32 size,
        4: string language,
        5: string country) throws(1: TalkException e);

    Coin getTotalBalance(
        2: PaymentType appStoreCode) throws(1: TalkException e);

    i64 notifyDownloaded(
        2: i64 packageId,
        3: string language) throws(1: TalkException e);

    PaymentReservationResult reserveCoinPurchase(
        2: CoinPurchaseReservation request) throws(1: TalkException e);

    PaymentReservationResult reservePayment(
        2: PaymentReservation paymentReservation) throws(1: TalkException e);
}

service SnsAdaptorService {
    SnsFriends getSnsFriends(
        2: SnsIdType snsIdType,
        3: string snsAccessToken,
        4: i32 startIdx,
        5: i32 limit) throws(1: TalkException e);

    SnsProfile getSnsMyProfile(
        2: SnsIdType snsIdType,
        3: string snsAccessToken) throws(1: TalkException e);

    void postSnsInvitationMessage(
        2: SnsIdType snsIdType,
        3: string snsAccessToken,
        4: string toSnsUserId) throws(1: TalkException e);
}

service TalkService {

    map<string, list<ChatRoomAnnouncement>> getChatRoomAnnouncementsBulk(
        2: list<string> chatRoomMids) throws (1: TalkException e);

    list<ChatRoomAnnouncement> getChatRoomAnnouncements(
        2: string chatRoomMid) throws (1: TalkException e);

    ChatRoomAnnouncement createChatRoomAnnouncement(
        1: i32 reqSeq,
        2: string chatRoomMid,
        3: ChatRoomAnnouncementType type,
        4: ChatRoomAnnouncementContents contents) throws (1: TalkException e);

    void removeChatRoomAnnouncement(
        1: i32 reqSeq,
        2: string chatRoomMid,
        3: i64 announcementSeq) throws (1: TalkException e);

    void unsendMessage(
        1: i32 seq,
        2: string messageId) throws (1: TalkException e);

    Group getGroupWithoutMembers(
        2: string groupId) throws (1: TalkException e);

    void requestResendMessage(
        1: i32 reqSeq,
        2: string senderMid,
        3: string messageId) throws (1: TalkException e);

    void respondResendMessage(
        1: i32 reqSeq,
        2: string receiverMid,
        3: string originalMessageId,
        4: Message resendMessage,
        5: ErrorCode errorCode) throws (1: TalkException e);

    void acceptGroupInvitation(
        1: i32 reqSeq,
        2: string groupId) throws(1: TalkException e);

    void acceptGroupInvitationByTicket(
        1: i32 reqSeq,
        2: string GroupMid,
        3: string ticketId) throws(1: TalkException e);

    void acceptProximityMatches(
        2: string sessionId,
        3: set<string> ids) throws(1: TalkException e);

    list<string> acquireCallRoute(
        2: string to) throws(1: TalkException e);

    string acquireCallTicket(
        2: string to) throws(1: TalkException e);

    string acquireEncryptedAccessToken(
        2: FeatureType featureType) throws(1: TalkException e);

    string addSnsId(
        2: SnsIdType snsIdType,
        3: string snsAccessToken) throws(1: TalkException e);

    void blockContact(
        1: i32 reqSeq,
        2: string id) throws(1: TalkException e);

    void blockRecommendation(
        1: i32 reqSeq,
        2: string id) throws(1: TalkException e);

    void cancelGroupInvitation(
        1: i32 reqSeq,
        2: string groupId,
        3: list<string> contactIds) throws(1: TalkException e);

    VerificationSessionData changeVerificationMethod(
        2: string sessionId,
        3: VerificationMethod method) throws(1: TalkException e);

    void clearIdentityCredential() throws(1: TalkException e);

    void clearMessageBox(
        2: string channelId,
        3: string messageBoxId) throws(1: TalkException e);

    void closeProximityMatch(
        2: string sessionId) throws(1: TalkException e);

    map<string, string> commitSendMessage(
        1: i32 seq,
        2: string messageId,
        3: list<string> receiverMids) throws(1: TalkException e);

    map<string, string> commitSendMessages(
        1: i32 seq,
        2: list<string> messageIds,
        3: list<string> receiverMids) throws(1: TalkException e);

    map<string, string> commitUpdateProfile(
        1: i32 seq,
        2: list<ProfileAttribute> attrs,
        3: list<string> receiverMids) throws(1: TalkException e);

    void confirmEmail(
        2: string verifier,
        3: string pinCode) throws(1: TalkException e);

    Group createGroup(
        1: i32 seq,
        2: string name,
        3: list<string> contactIds) throws(1: TalkException e);

    string createQrcodeBase64Image(
        2: string url,
        3: string characterSet,
        4: i32 imageSize,
        5: i32 x,
        6: i32 y,
        7: i32 width,
        8: i32 height) throws(1: TalkException e);

    Room createRoom(
        1: i32 reqSeq,
        2: list<string> contactIds) throws(1: TalkException e);

    string createSession() throws(1: TalkException e);

    list<Announcement> fetchAnnouncements(
        2: i32 lastFetchedIndex) throws(1: TalkException e);

    list<Message> fetchMessages(
        2: i64 localTs,
        3: i32 count) throws(1: TalkException e);

    list<Operation> fetchOperations(
        2: i64 localRev,
        3: i32 count) throws(1: ShouldSyncException e);

    list<Operation> fetchOps(
        2: i64 localRev,
        3: i32 count,
        4: i64 globalRev,
        5: i64 individualRev) throws (1: ShouldSyncException e);

    map<string, Contact> findAndAddContactsByEmail(
        1: i32 reqSeq,
        2: set<string> emails) throws(1: TalkException e);

    map<string, Contact> findAndAddContactsByMid(
        1: i32 reqSeq,
        2: string mid,
        3: ContactType type,
        4: string reference) throws (1: TalkException e);

    Group findGroupByTicketV2(
        1: string ticketId) throws (1: TalkException e);

    map<string, Contact> findAndAddContactsByPhone(
        1: i32 reqSeq,
        2: set<string> phones) throws(1: TalkException e);

    list<FriendRequest> getFriendRequests(
        1: FriendRequestDirection direction,
        2: i64 lastSeenSeqId) throws (1: TalkException e);

    void removeFriendRequest(
        1: FriendRequestDirection direction,
        2: string midOrEMid) throws (1: TalkException e);

    map<string, Contact> findAndAddContactsByUserid(
        1: i32 reqSeq,
        2: string userid) throws(1: TalkException e);

    Contact findContactByUserid(
        2: string userid) throws(1: TalkException e);

    Contact findContactByUserTicket(
        2: string ticketIdWithTag) throws(1: TalkException e);

    map<string, Contact> findContactsByEmail(
        2: set<string> emails) throws(1: TalkException e);

    map<string, Contact> findContactsByPhone(
        2: set<string> phones) throws(1: TalkException e);

    SnsIdUserStatus findSnsIdUserStatus(
        2: SnsIdType snsIdType,
        3: string snsAccessToken,
        4: string udidHash) throws(1: TalkException e);

    void finishUpdateVerification(
        2: string sessionId) throws(1: TalkException e);

    Ticket generateUserTicket(
        3: i64 expirationTime,
        4: i32 maxUseCount) throws(1: TalkException e);

    void destroyMessage(
        1: i32 seq,
        2: string chatId,
        3: string messageId,
        4: i8 sessionId) throws (1: TalkException e);

    set<string> getAcceptedProximityMatches(
        2: string sessionId) throws(1: TalkException e);

    list<string> getActiveBuddySubscriberIds() throws(1: TalkException e);

    list<string> getAllContactIds() throws(1: TalkException e);

    AuthQrcode getAuthQrcode(
        2: bool keepLoggedIn,
        3: string systemName) throws(1: TalkException e);

    list<string> getBlockedContactIds() throws(1: TalkException e);

    RegisterWithPhoneNumberResult registerWithPhoneNumber(
        2: string sessionId,
        3: string migrationPincodeSessionId) throws (1: TalkException e);

    RegisterWithPhoneNumberResult registerWithPhoneNumberAndPassword(
        2: string sessionId,
        3: string keynm,
        4: string encrypted) throws (1: TalkException e);

    AnalyticsInfo getAnalyticsInfo() throws (1: TalkException e);

    void reportClientStatistics(
        1: i32 reqSeq,
        2: ReportCategory category,
        3: i32 count) throws (1: TalkException e);

    string verifyPhoneNumberForLogin(
        2: string verifierFromPhone,
        3: string pinCodeForPhone,
        4: string verifierFromLogin) throws (1: TalkException e);

    PhoneVerificationResult verifyPhoneNumber(
        2: string sessionId,
        3: string pinCode,
        4: string udidHash,
        5: string migrationPincodeSessionId,
        6: string oldUdidHash) throws (1: TalkException e);

    list<string> getBlockedContactIdsByRange(
        2: i32 start,
        3: i32 count) throws(1: TalkException e);

    list<string> getBlockedRecommendationIds() throws(1: TalkException e);

    list<string> getBuddyBlockerIds() throws(1: TalkException e);

    Geolocation getBuddyLocation(
        2: string mid,
        3: i32 index) throws(1: TalkException e);

    list<CompactContact> getCompactContactsModifiedSince(
        2: i64 timestamp) throws(1: TalkException e);

    Group getCompactGroup(
        2: string groupId) throws(1: TalkException e);

    Room getCompactRoom(
        2: string roomId) throws(1: TalkException e);

    Contact getContact(
        2: string id) throws(1: TalkException e);

    list<Contact> getContacts(
        2: list<string> ids) throws(1: TalkException e);

    Contact getContactWithFriendRequestStatus(
        2: string id) throws (1: TalkException e);

    string getCountryWithRequestIp() throws(1: TalkException e);

    list<string> getFavoriteMids() throws(1: TalkException e);

    Group getGroup(
        2: string groupId) throws(1: TalkException e);

    list<string> getGroupIdsInvited() throws(1: TalkException e);

    list<string> getGroupIdsJoined() throws(1: TalkException e);

    list<Group> getGroups(
        2: list<string> groupIds) throws(1: TalkException e);

    list<string> getHiddenContactMids() throws(1: TalkException e);

    string getIdentityIdentifier() throws(1: TalkException e);

    i32 getLastAnnouncementIndex() throws(1: TalkException e);

    i64 getLastOpRevision() throws(1: TalkException e);

    SuggestDictionaryRevisions getSuggestRevisions() throws (1: TalkException e);

    list<Message> getPreviousMessagesV2WithReadCount(
        2: string messageBoxId,
        3: MessageBoxV2MessageId endMessageId,
        4: i32 messagesCount) throws (1: TalkException e);

    TMessageBox getMessageBox(
        2: string channelId,
        3: string messageBoxId,
        4: i32 lastMessagesCount) throws(1: TalkException e);

    TMessageBoxWrapUp getMessageBoxCompactWrapUp(
        2: string mid) throws(1: TalkException e);

    TMessageBoxWrapUpResponse getMessageBoxCompactWrapUpList(
        2: i32 start,
        3: i32 messageBoxCount) throws(1: TalkException e);

    list<TMessageBox> getMessageBoxList(
        2: string channelId,
        3: i32 lastMessagesCount) throws(1: TalkException e);

    list<TMessageBox> getMessageBoxListByStatus(
        2: string channelId,
        3: i32 lastMessagesCount,
        4: i32 status) throws(1: TalkException e);

    TMessageBoxWrapUp getMessageBoxWrapUp(
        2: string mid) throws(1: TalkException e);

    TMessageBoxWrapUpResponse getMessageBoxWrapUpList(
        2: i32 start,
        3: i32 messageBoxCount) throws(1: TalkException e);

    list<Message> getMessagesBySequenceNumber(
        2: string channelId,
        3: string messageBoxId,
        4: i64 startSeq,
        5: i64 endSeq) throws(1: TalkException e);

    list<Message> getNextMessages(
        2: string messageBoxId,
        3: i64 startSeq,
        4: i32 messagesCount) throws(1: TalkException e);

    list<NotificationType> getNotificationPolicy(
        2: CarrierCode carrier) throws(1: TalkException e);

    list<Message> getPreviousMessages(
        2: string messageBoxId,
        3: i64 endSeq,
        4: i32 messagesCount) throws(1: TalkException e);

    Profile getProfile() throws(1: TalkException e);

    ProximityMatchCandidateResult getProximityMatchCandidateList(
        2: string sessionId) throws(1: TalkException e);

    set<Contact> getProximityMatchCandidates(
        2: string sessionId) throws(1: TalkException e);

    list<Message> getRecentMessages(
        2: string messageBoxId,
        3: i32 messagesCount) throws(1: TalkException e);

    list<string> getRecommendationIds() throws(1: TalkException e);

    Room getRoom(
        2: string roomId) throws(1: TalkException e);

    RSAKey getRSAKeyInfo(
        2: IdentityProvider provider) throws(1: TalkException e);

    i64 getServerTime() throws(1: TalkException e);

    list<LoginSession> getSessions() throws(1: TalkException e);

    Settings getSettings() throws(1: TalkException e);

    list<Group> getGroupsV2(
        2: list<string> groupIds) throws (1: TalkException e);

    Settings getSettingsAttributes(
        2: i32 attrBitset) throws(1: TalkException e);

    SystemConfiguration getSystemConfiguration() throws(1: TalkException e);

    Ticket getUserTicket() throws(1: TalkException e);

    WapInvitation getWapInvitation(
        2: string invitationHash) throws(1: TalkException e);

    void invalidateUserTicket() throws(1: TalkException e);

    void inviteFriendsBySms(
        2: list<string> phoneNumberList) throws(1: TalkException e);

    void inviteIntoGroup(
        1: i32 reqSeq,
        2: string groupId,
        3: list<string> contactIds) throws(1: TalkException e);

    void inviteIntoRoom(
        1: i32 reqSeq,
        2: string roomId,
        3: list<string> contactIds) throws(1: TalkException e);

    void inviteViaEmail(
        1: i32 reqSeq,
        2: string email,
        3: string name) throws(1: TalkException e);

    bool isIdentityIdentifierAvailable(
        3: IdentityProvider provider,
        2: string identifier) throws(1: TalkException e);

    bool isUseridAvailable(
        2: string userid) throws(1: TalkException e);

    void kickoutFromGroup(
        1: i32 reqSeq,
        2: string groupId,
        3: list<string> contactIds) throws(1: TalkException e);

    string reissueGroupTicket(
       1: string groupMid 
    ) throws(1: TalkException e);

    Group findGroupByTicket(
        1: string ticketId
    ) throws(1: TalkException e);

    void leaveGroup(
        1: i32 reqSeq,
        2: string groupId) throws(1: TalkException e);

    void leaveRoom(
        1: i32 reqSeq,
        2: string roomId) throws(1: TalkException e);

    string loginWithIdentityCredential(
        8: IdentityProvider identityProvider,
        3: string identifier,
        4: string password,
        5: bool keepLoggedIn,
        6: string accessLocation,
        7: string systemName,
        9: string certificate) throws(1: TalkException e);

    LoginResult loginWithIdentityCredentialForCertificate(
        8: IdentityProvider identityProvider,
        3: string identifier,
        4: string password,
        5: bool keepLoggedIn,
        6: string accessLocation,
        7: string systemName,
        9: string certificate) throws(1: TalkException e);

    string loginWithVerifier(
        3: string verifier) throws(1: TalkException e);

    LoginResult loginWithVerifierForCerificate(
        3: string verifier) throws(1: TalkException e);

    LoginResult loginWithVerifierForCertificate(
        3: string verifier) throws(1: TalkException e);

    void logout() throws(1: TalkException e);

    void logoutSession(
        2: string tokenKey) throws(1: TalkException e);

    void noop() throws(1: TalkException e);

    void notifiedRedirect(
        2: map<string, string> paramMap) throws(1: TalkException e);

    map<string, string> notifyBuddyOnAir(
        1: i32 seq,
        2: list<string> receiverMids) throws(1: TalkException e);

    void notifyIndividualEvent(
        2: NotificationStatus notificationStatus,
        3: list<string> receiverMids) throws(1: TalkException e);

    void notifyInstalled(
        2: string udidHash,
        3: string applicationTypeWithExtensions) throws(1: TalkException e);

    void notifyRegistrationComplete(
        2: string udidHash,
        3: string applicationTypeWithExtensions) throws(1: TalkException e);

    void notifySleep(
        2: i64 lastRev,
        3: i32 badge) throws(1: TalkException e);

    void notifyUpdated(
        2: i64 lastRev,
        3: DeviceInfo deviceInfo) throws(1: TalkException e);

    string openProximityMatch(
        2: Location location) throws(1: TalkException e);

    string registerBuddyUser(
        2: string buddyId,
        3: string registrarPassword) throws(1: TalkException e);

    void registerBuddyUserid(
        2: i32 seq,
        3: string userid) throws(1: TalkException e);

    string registerDevice(
        2: string sessionId) throws(1: TalkException e);

    string registerDeviceWithIdentityCredential(
        2: string sessionId,
        5: IdentityProvider provider,
        3: string identifier,
        4: string verifier) throws(1: TalkException e);

    string registerDeviceWithoutPhoneNumber(
        2: string region,
        3: string udidHash,
        4: DeviceInfo deviceInfo) throws(1: TalkException e);

    string registerDeviceWithoutPhoneNumberWithIdentityCredential(
        2: string region,
        3: string udidHash,
        4: DeviceInfo deviceInfo,
        5: IdentityProvider provider,
        6: string identifier,
        7: string verifier,
        8: string mid,
        9: string migrationPincodeSessionId) throws(1: TalkException e);

    bool registerUserid(
        1: i32 reqSeq,
        2: string userid) throws(1: TalkException e);

    string registerWapDevice(
        2: string invitationHash,
        3: string guidHash,
        4: string email,
        5: DeviceInfo deviceInfo) throws(1: TalkException e);

    string registerWithExistingSnsIdAndIdentityCredential(
        2: IdentityCredential identityCredential,
        3: string region,
        4: string udidHash,
        5: DeviceInfo deviceInfo) throws(1: TalkException e);

    RegisterWithSnsIdResult registerWithSnsId(
        2: SnsIdType snsIdType,
        3: string snsAccessToken,
        4: string region,
        5: string udidHash,
        6: DeviceInfo deviceInfo,
        7: string mid) throws(1: TalkException e);

    string registerWithSnsIdAndIdentityCredential(
        2: SnsIdType snsIdType,
        3: string snsAccessToken,
        4: IdentityCredential identityCredential,
        5: string region,
        6: string udidHash,
        7: DeviceInfo deviceInfo) throws(1: TalkException e);

    string reissueDeviceCredential() throws(1: TalkException e);

    string reissueUserTicket(
        3: i64 expirationTime,
        4: i32 maxUseCount) throws(1: TalkException e);

    list<TMessageReadRange> getMessageReadRange(
        2: list<string> chatIds) throws (1: TalkException e);

    void rejectGroupInvitation(
        1: i32 reqSeq,
        2: string groupId) throws(1: TalkException e);

    void releaseSession() throws(1: TalkException e);

    void removeAllMessages(
        1: i32 seq,
        2: string lastMessageId) throws(1: TalkException e);

    void removeBuddyLocation(
        2: string mid,
        3: i32 index) throws(1: TalkException e);

    bool removeMessage(
        2: string messageId) throws(1: TalkException e);

    ContactTransition makeUserAddMyselfAsContact(
        1: string contactOwnerMid) throws (1: TalkException e);

    bool removeMessageFromMyHome(
        2: string messageId) throws(1: TalkException e);

    string removeSnsId(
        2: SnsIdType snsIdType) throws(1: TalkException e);

    void report(
        2: i64 syncOpRevision,
        3: SyncCategory category,
        4: string report) throws(1: TalkException e);

    list<ContactReportResult> reportContacts(
        2: i64 syncOpRevision,
        3: SyncCategory category,
        4: list<ContactReport> contactReports,
        5: SyncActionType actionType) throws(1: TalkException e);

    void reportGroups(
        2: i64 syncOpRevision,
        3: list<Group> groups) throws(1: TalkException e);

    void reportProfile(
        2: i64 syncOpRevision,
        3: Profile profile) throws(1: TalkException e);

    void reportRooms(
        2: i64 syncOpRevision,
        3: list<Room> rooms) throws(1: TalkException e);

    Contact findAndAddContactByMetaTag(
        1: i32 reqSeq,
        2: string userid,
        3: string reference) throws (1: TalkException e);

    void reportSettings(
        2: i64 syncOpRevision,
        3: Settings settings) throws(1: TalkException e);

    void reportSpam(
        2: string chatMid,
        3: list<string> memberMids,
        4: list<SpammerReason> spammerReasons,
        5: list<string> senderMids,
        6: list<string> spamMessageIds,
        7: list<string> spamMessages) throws (1: TalkException e);

    void reportSpammer(
        2: string spammerMid,
        3: list<SpammerReason> spammerReasons,
        4: list<string> spamMessageIds) throws(1: TalkException e);

    void requestAccountPasswordReset(
        4: IdentityProvider provider,
        2: string identifier,
        5: string locale) throws(1: TalkException e);

    EmailConfirmationSession requestEmailConfirmation(
        2: EmailConfirmation emailConfirmation) throws(1: TalkException e);

    void requestIdentityUnbind(
        4: IdentityProvider provider,
        2: string identifier) throws(1: TalkException e);

    EmailConfirmationSession resendEmailConfirmation(
        2: string verifier) throws(1: TalkException e);

    void resendPinCode(
        2: string sessionId) throws(1: TalkException e);

    void resendPinCodeBySMS(
        2: string sessionId) throws(1: TalkException e);

    void sendChatChecked(
        1: i32 seq,
        2: string consumer,
        3: string lastMessageId) throws(1: TalkException e);

    CommitMessageResult sendMessageAwaitCommit(
        1: i32 seq,
        2: Message message) throws (1: TalkException e);

    void sendChatRemoved(
        1: i32 seq,
        2: string consumer,
        3: string lastMessageId) throws(1: TalkException e);

    map<string, string> sendContentPreviewUpdated(
        1: i32 esq,
        2: string messageId,
        3: list<string> receiverMids) throws(1: TalkException e);

    void sendContentReceipt(
        1: i32 seq,
        2: string consumer,
        3: string messageId) throws(1: TalkException e);

    void sendDummyPush() throws(1: TalkException e);

    void removeE2EEPublicKey(
        2: E2EEPublicKey publicKey) throws (1: TalkException e);

    E2EENegotiationResult negotiateE2EEPublicKey(
        2: string mid) throws (1: TalkException e);

    E2EEPublicKey getE2EEPublicKey(
        2: string mid,
        3: i32 version,
        4: i32 keyId) throws (1: TalkException e);

    void requestE2EEKeyExchange(
        1: i32 reqSeq,
        2: binary temporalPublicKey,
        3: E2EEPublicKey publicKey,
        4: binary verifier) throws (1: TalkException e);

    map<string, E2EEPublicKey> getLastE2EEPublicKeys(
        2: string chatMid) throws (1: TalkException e);

    E2EEPublicKey registerE2EEPublicKey(
        1: i32 reqSeq,
        2: E2EEPublicKey publicKey) throws (1: TalkException e);

    list<E2EEPublicKey> getE2EEPublicKeys() throws (1: TalkException e);

    list<E2EEPublicKey> getE2EEPublicKeysEx(
        2: bool ignoreE2EEStatus) throws (1: TalkException e);

    list<Operation> getReadMessageOpsInBulk(
        2: list<string> chatIds) throws (1: TalkException e);

    Message sendEvent(
        1: i32 seq,
        2: Message message) throws(1: TalkException e);

    Message sendMessage(
        1: i32 seq,
        2: Message message) throws(1: TalkException e);

    void sendMessageIgnored(
        1: i32 seq,
        2: string consumer,
        3: list<string> messageIds) throws(1: TalkException e);

    void sendMessageReceipt(
        1: i32 seq,
        2: string consumer,
        3: list<string> messageIds) throws(1: TalkException e);

    Contact findContactByMetaTag(
        2: string userid,
        3: string reference) throws (1: TalkException e);

    Message sendMessageToMyHome(
        1: i32 seq,
        2: Message message) throws(1: TalkException e);

    void setBuddyLocation(
        2: string mid,
        3: i32 index,
        4: Geolocation location) throws(1: TalkException e);

    void setIdentityCredential(
        2: string identifier,
        3: string verifier,
        4: IdentityProvider provider) throws(1: TalkException e);

    void setNotificationsEnabled(
        1: i32 reqSeq,
        2: MIDType type,
        3: string target,
        4: bool enablement) throws(1: TalkException e);

    VerificationSessionData startUpdateVerification(
        2: string region,
        3: CarrierCode carrier,
        4: string phone,
        5: string udidHash,
        6: DeviceInfo deviceInfo,
        7: string networkCode,
        8: string locale) throws(1: TalkException e);

    VerificationSessionData startVerification(
        2: string region,
        3: CarrierCode carrier,
        4: string phone,
        5: string udidHash,
        6: DeviceInfo deviceInfo,
        7: string networkCode,
        8: string mid,
        9: string locale,
        10: SIMInfo simInfo,
        11: string oldUdidHash) throws(1: TalkException e);

    void updateGroupPreferenceAttribute(
        1: i32 reqSeq,
        2: string groupMid,
        3: map<GroupPreferenceAttribute, string> updatedAttrs) throws (1: TalkException e);

    Room createRoomV2(
        1: i32 reqSeq,
        2: list<string> contactIds) throws (1: TalkException e);

    void storeUpdateProfileAttribute(
        1: i32 seq,
        2: ProfileAttribute profileAttribute,
        3: string value) throws(1: TalkException e);

    list<SnsFriendContactRegistration> syncContactBySnsIds(
        1: i32 reqSeq,
        2: list<SnsFriendModification> modifications) throws(1: TalkException e);

    map<string, ContactRegistration> syncContacts(
        1: i32 reqSeq,
        2: list<ContactModification> localContacts) throws(1: TalkException e);

    Message trySendMessage(
        1: i32 seq,
        2: Message message) throws(1: TalkException e);

    list<Message> getNextMessagesV2(
        2: string messageBoxId,
        3: MessageBoxV2MessageId startMessageId,
        4: i32 messagesCount) throws (1: TalkException e);

    TMessageBoxWrapUp getMessageBoxCompactWrapUpV2(
        2: string messageBoxId) throws (1: TalkException e);

    list<Message> getRecentMessagesV2(
        2: string messageBoxId,
        3: i32 messagesCount) throws (1: TalkException e);

    map<string, string> validateContactsOnBot(
        2: list<string> contacts) throws (1: TalkException e);

    void tryFriendRequest(
        1: string midOrEMid,
        2: FriendRequestMethod method,
        3: string friendRequestParams) throws (1: TalkException e);

    void unblockContact(
        1: i32 reqSeq,
        2: string id) throws(1: TalkException e);

    void unblockRecommendation(
        1: i32 reqSeq,
        2: string id) throws(1: TalkException e);

    string unregisterUserAndDevice() throws(1: TalkException e);

    void updateApnsDeviceToken(
        2: binary apnsDeviceToken) throws(1: TalkException e);

    void updateBuddySetting(
        2: string key,
        3: string value) throws(1: TalkException e);

    void updateC2DMRegistrationId(
        2: string registrationId) throws(1: TalkException e);

    void updateContactSetting(
        1: i32 reqSeq,
        2: string mid,
        3: ContactSetting flag,
        4: string value) throws(1: TalkException e);

    void updateCustomModeSettings(
        2: CustomMode customMode,
        3: map<string, string> paramMap) throws(1: TalkException e);

    void updateDeviceInfo(
        2: string deviceUid,
        3: DeviceInfo deviceInfo) throws(1: TalkException e);

    void updateGroup(
        1: i32 reqSeq,
        2: Group group) throws(1: TalkException e);

    void updateNotificationToken(
        3: NotificationType type,
        2: string token) throws(1: TalkException e);

    void updateNotificationTokenWithBytes(
        3: NotificationType type,
        2: binary token) throws(1: TalkException e);

    void updateProfile(
        1: i32 reqSeq,
        2: Profile profile) throws(1: TalkException e);

    void updateProfileAttribute(
        1: i32 reqSeq,
        2: ProfileAttribute attr,
        3: string value) throws(1: TalkException e);

    void updateRegion(
        2: string region) throws(1: TalkException e);

    void updateSettings(
        1: i32 reqSeq,
        2: Settings settings) throws(1: TalkException e);

    i32 updateSettings2(
        1: i32 reqSeq,
        2: Settings settings) throws(1: TalkException e);

    void updateSettingsAttribute(
        1: i32 reqSeq,
        2: SettingsAttribute attr,
        3: string value) throws(1: TalkException e);

    i32 updateSettingsAttributes(
        1: i32 reqSeq,
        2: i32 attrBitset,
        3: Settings settings) throws(1: TalkException e);

    void verifyIdentityCredential(
        8: IdentityProvider identityProvider,
        3: string identifier,
        4: string password) throws(1: TalkException e);

    UserAuthStatus verifyIdentityCredentialWithResult(
        2: IdentityCredential identityCredential) throws(1: TalkException e);

    VerificationResult verifyPhone(
        2: string sessionId,
        3: string pinCode,
        4: string udidHash) throws(1: TalkException e);

    string verifyQrcode(
        2: string verifier,
        3: string pinCode) throws(1: TalkException e);
}

service UniversalNotificationService {
    void notify(
        2: GlobalEvent event) throws(1: UniversalNotificationServiceException e);
}

service CallService {

    UserStatus getUserStatus(
        1: string mid) throws (1: TalkException e);

    void updateProfileAttributeForChannel(
        2: ProfileAttribute profileAttribute,
        3: string value) throws (1: TalkException e);
    
    void updateExtendedProfileAttribute(
        1: ExtendedProfileAttribute attr,
        2: ExtendedProfile extendedProfile) throws (1: TalkException e);

    list<SimpleChannelContact> getAllSimpleChannelContacts(
        1: bool statusSticonFallbackDisabled) throws (1: TalkException e);

    map<RegistrationType, string> getUserIdentities() throws (1: TalkException e);

    PaidCallDialing markPaidCallAd(
        2: string dialedNumber,
        3: string language,
        4: bool disableCallerId) throws (1: TalkException e);

    bool isGroupMember(
        1: string groupId) throws (1: TalkException e);

    PhoneInfoForChannel getPhoneInfoFromPhoneNumber(
        1: string region,
        2: string phoneNumber) throws (1: TalkException e);

    PaidCallRedeemResult redeemPaidCallVoucher(
        2: string serial,
        3: string language) throws (1: TalkException e);

    map<string, string> getPreferredDisplayName(
        1: list<string> mids) throws (1: TalkException e);

    list<Contact> getContactsForChannel(
        2: list<string> ids) throws (1: TalkException e);

    list<CoinProductItem> getCallCreditProducts(
        2: PaymentType appStoreCode,
        3: PaymentPgType pgCode,
        4: string country,
        5: string language) throws (1: TalkException e);

    list<CompactContact> getCompactContacts(
        2: i64 lastModifiedTimestamp) throws (1: TalkException e);

    void notifyNotiCenterEvent(
        1: NotiCenterEventData event) throws (1: TalkException e);

    bool isInContact(
        2: string mid) throws (1: TalkException e);

    list<SimpleChannelContact> lookupGroupMembers(
        1: string groupId,
        2: list<string> mids) throws (1: TalkException e);

    Room getRoomInformation(
        1: string roomMid) throws (1: TalkException e);

    GroupCall getGroupCall(
        2: string chatMid) throws (1: TalkException e);

    bool isAllowSecondaryDeviceLogin() throws (1: TalkException e);

    SimpleChannelClient getPrimaryClientForChannel() throws (1: TalkException e);

    Room createRoomWithBuddy(
        1: i32 reqSeq,
        2: string buddyMid,
        3: list<string> contactIds) throws (1: TalkException e);

    string getDisplayName(
        2: string mid) throws (1: TalkException e);

    PaidCallMetadataResult getPaidCallMetadata(
        2: string language) throws (1: TalkException e);

    string getMid() throws (1: TalkException e);

    string getUserCountryForBilling(
        2: string country,
        3: string remoteIp) throws (1: TalkException e);

    list<string> getFavoriteGroupIdsForChannel() throws (1: TalkException e);

    PaidCallHistoryResult getPaidCallHistory(
        2: i64 start,
        3: i32 size,
        4: string language) throws (1: TalkException e);

    void sendPinCodeOperation(
        1: string verifier) throws (1: TalkException e);

    void inviteIntoGroupCall(
        2: string chatMid,
        3: list<string> memberMids,
        4: GroupCallMediaType mediaType) throws (1: TalkException e);

    list<string> getFriendMids() throws (1: TalkException e);

    MetaProfile getMetaProfile() throws (1: TalkException e);

    Message sendMessageForChannel(
        2: Message message) throws (1: TalkException e);

    i64 activeBuddySubscriberCount() throws (1: TalkException e);

    CoinHistoryResult getCallCreditPurchaseHistory(
        2: CoinHistoryCondition request) throws (1: TalkException e);

    bool isRoomMember(
        1: string roomId) throws (1: TalkException e);

    Message sendSystemOAMessage(
        1: Message message) throws (1: TalkException e);

    PaidCallResponse acquirePaidCallRoute(
        2: PaidCallType paidCallType,
        3: string dialedNumber,
        4: string language,
        5: string networkCode,
        6: bool disableCallerId,
        7: string referer,
        8: string adSessionId) throws (1: TalkException e);

    list<Group> getGroupsForChannel(
        1: list<string> groupIds) throws (1: TalkException e);

    i64 getUserCreateTime() throws (1: TalkException e);

    string registerChannelCP(
        2: string cpId,
        3: string registerPassword) throws (1: TalkException e);

    PaymentReservationResult reserveCallCreditPurchase(
        2: CoinPurchaseReservation request) throws (1: TalkException e);

    list<PaidCallCurrencyExchangeRate> acquirePaidCallCurrencyExchangeRate(
        2: string language) throws (1: TalkException e);

    list<string> getRoomMemberMidsForAppPlatform(
        1: string roomId) throws (1: TalkException e);

    list<PaidCallBalance> getPaidCallBalanceList(
        2: string language) throws (1: TalkException e);

    map<PersonalInfo, string> getPersonalInfos(
        1: set<PersonalInfo> requiredPersonalInfos) throws (1: TalkException e);

    list<SimpleChannelClient> getPrimaryClientsForChannel(
        1: list<string> userMids) throws (1: TalkException e);

    ContactTransition addBuddyToContact(
        1: string buddyMid) throws (1: TalkException e);

    list<string> getGroupMemberMidsForAppPlatform(
        1: string groupId) throws (1: TalkException e);

    string getUserLanguage() throws (1: TalkException e);

    PaidCallResponse lookupPaidCall(
        2: string dialedNumber,
        3: string language,
        4: string referer) throws (1: TalkException e);

    ExtendedProfile getExtendedProfile() throws (1: TalkException e);

    map<string, CompactContact> getReverseCompactContacts(
        1: list<string> ids) throws (1: TalkException e);

    PaidCallAdResult getPaidCallAdStatus() throws (1: TalkException e);

    Contact findContactByUseridWithoutAbuseBlockForChannel(
        2: string userid) throws (1: TalkException e);

    list<string> getGroupMemberMids(
        1: string groupId) throws (1: TalkException e);

    Message sendMessageWithoutRelationship(
        2: Message message) throws (1: TalkException e);

    map<string, i64> displayBuddySubscriberCountInBulk(
        1: list<string> mids) throws (1: TalkException e);

    list<SimpleChannelContact> lookupRoomMembers(
        1: string roomId,
        2: list<string> mids) throws (1: TalkException e);

    list<string> getFavoriteMidsForChannel() throws (1: TalkException e);

    list<string> getAllContactIdsForChannel() throws (1: TalkException e);

    i64 displayBuddySubscriberCount() throws (1: TalkException e);

    Profile getProfileForChannel() throws (1: TalkException e);

    list<UserTicketResponse> getUserTickets(
        1: list<string> userMids) throws (1: TalkException e);

    list<string> getOAFriendMids() throws (1: TalkException e);

    list<PaidCallUserRate> searchPaidCallUserRate(
        2: string countryCode,
        3: string language) throws (1: TalkException e);

    list<string> getJoinedGroupIdsForChannel() throws (1: TalkException e);

    GroupCallRoute acquireGroupCallRoute(
        2: string chatMid,
        3: GroupCallMediaType mediaType) throws (1: TalkException e);

    list<string> getUserMidsWhoAddedMe() throws (1: TalkException e);

    IdentityCredential getIdentityCredential() throws (1: TalkException e);

    void addOperationForChannel(
        1: OpType opType,
        2: string param1,
        3: string param2,
        4: string param3) throws (1: TalkException e);

    list<SimpleChannelContact> getSimpleChannelContacts(
        1: list<string> ids,
        2: bool statusSticonFallbackDisabled) throws (1: TalkException e);

    i64 getUserLastSentMessageTimeStamp(
        1: string mid) throws (1: TalkException e);
}

service AuthService {

    string normalizePhoneNumber(
        2: string countryCode,
        3: string phoneNumber,
        4: string countryCodeHint) throws (1: TalkException e);

    void respondE2EELoginRequest(
        1: string verifier,
        2: E2EEPublicKey publicKey,
        3: binary encryptedKeyChain,
        4: binary hashKeyChain,
        5: ErrorCode errorCode) throws (1: TalkException e);

    string confirmE2EELogin(
        1: string verifier,
        2: binary deviceSecret) throws (1: TalkException e);

    void logoutZ() throws (1: TalkException e);

    LoginResult loginZ(
        2: LoginRequest loginRequest) throws (1: TalkException e);

    SecurityCenterResult issueTokenForAccountMigrationSettings(
        2: bool enforce) throws (1: TalkException e);

    SecurityCenterResult issueTokenForAccountMigration(
        2: string migrationSessionId) throws (1: TalkException e);

    string verifyQrcodeWithE2EE(
        2: string verifier,
        3: string pinCode,
        4: ErrorCode errorCode,
        5: E2EEPublicKey publicKey,
        6: binary encryptedKeyChain,
        7: binary hashKeyChain) throws (1: TalkException e);

}

service SquareService {

    GetSquareChatAnnouncementsResponse getSquareChatAnnouncements(
        1: GetSquareChatAnnouncementsRequest request) throws(1: SquareException e);

    DeleteSquareChatAnnouncementResponse deleteSquareChatAnnouncement(
        1: DeleteSquareChatAnnouncementRequest request) throws(1: SquareException e);

    CreateSquareChatAnnouncementResponse createSquareChatAnnouncement(
        1: CreateSquareChatAnnouncementRequest request) throws(1: SquareException e);

    GetNoteStatusResponse getNoteStatus(
        1: GetNoteStatusRequest request) throws(1: SquareException e);

    GetSquareStatusResponse getSquareStatus(
        1: GetSquareStatusRequest request) throws(1: SquareException e);

    ReportSquareMemberResponse reportSquareMember(
        1: ReportSquareMemberRequest request) throws(1: SquareException e);

    ReportSquareMessageResponse reportSquareMessage(
        1: ReportSquareMessageRequest request) throws(1: SquareException e);

    ReportSquareChatResponse reportSquareChat(
        1: ReportSquareChatRequest request) throws(1: SquareException e);

    ReportSquareResponse reportSquare(
        1: ReportSquareRequest request) throws(1: SquareException e);

    UpdateSquareMemberRelationResponse updateSquareMemberRelation(
        1: UpdateSquareMemberRelationRequest request) throws(1: SquareException e);

    UpdateSquareAuthorityResponse updateSquareAuthority(
        1: UpdateSquareAuthorityRequest request) throws(1: SquareException e);

    UpdateSquareChatMemberResponse updateSquareChatMember(
        1: UpdateSquareChatMemberRequest request) throws(1: SquareException e);

    UpdateSquareChatResponse updateSquareChat(
        1: UpdateSquareChatRequest request) throws(1: SquareException e);

    RefreshSubscriptionsResponse refreshSubscriptions(
        1: RefreshSubscriptionsRequest request) throws(1: SquareException e);

    RemoveSubscriptionsResponse removeSubscriptions(
        1: RemoveSubscriptionsRequest request) throws(1: SquareException e);

    RejectSquareMembersResponse rejectSquareMembers(
        1: RejectSquareMembersRequest request) throws(1: SquareException e);

    UpdateSquareMembersResponse updateSquareMembers(
        1: UpdateSquareMembersRequest request) throws(1: SquareException e);

    UpdateSquareMemberResponse updateSquareMember(
        1: UpdateSquareMemberRequest request) throws(1: SquareException e);

    UpdateSquareFeatureSetResponse updateSquareFeatureSet(
        1: UpdateSquareFeatureSetRequest request) throws(1: SquareException e);

    GetSquareFeatureSetResponse getSquareFeatureSet(
        1: GetSquareFeatureSetRequest request) throws(1: SquareException e);

    SearchSquaresResponse searchSquares(
        1: SearchSquaresRequest request) throws(1: SquareException e);

    UpdateSquareResponse updateSquare(
        1: UpdateSquareRequest request) throws(1: SquareException e);

    GetSquareCategoriesResponse getCategories(
        1: GetSquareCategoriesRequest request) throws(1: SquareException e);

    SearchSquareMembersResponse searchSquareMembers(
        1: SearchSquareMembersRequest request) throws(1: SquareException e);

    FetchSquareChatEventsResponse fetchSquareChatEvents(
        1: FetchSquareChatEventsRequest request) throws(1: SquareException e);

    FetchMyEventsResponse fetchMyEvents(
        1: FetchMyEventsRequest request) throws(1: SquareException e);

    MarkAsReadResponse markAsRead(
        1: MarkAsReadRequest request) throws(1: SquareException e);

    GetSquareAuthorityResponse getSquareAuthority(
        1: GetSquareAuthorityRequest request) throws(1: SquareException e);
    
    SendMessageResponse sendMessage(
        1: SendMessageRequest request) throws(1: SquareException e);
    
    LeaveSquareResponse leaveSquare(
        1: LeaveSquareRequest request) throws(1: SquareException e);
    
    LeaveSquareChatResponse leaveSquareChat(
        1: LeaveSquareChatRequest request) throws(1: SquareException e);
    
    JoinSquareChatResponse joinSquareChat(
        1: JoinSquareChatRequest request) throws(1: SquareException e);
    
    JoinSquareResponse joinSquare(
        1: JoinSquareRequest request) throws(1: SquareException e);
    
    InviteToSquareResponse inviteToSquare(
        1: InviteToSquareRequest request) throws(1: SquareException e);
    
    InviteToSquareChatResponse inviteToSquareChat(
        1: InviteToSquareChatRequest request) throws(1: SquareException e);
    
    GetSquareMemberResponse getSquareMember(
        1: GetSquareMemberRequest request) throws(1: SquareException e);
    
    GetSquareMembersResponse getSquareMembers(
        1: GetSquareMembersRequest request) throws(1: SquareException e);
    
    GetSquareMemberRelationResponse getSquareMemberRelation(
        1: GetSquareMemberRelationRequest request) throws(1: SquareException e);
    
    GetSquareMemberRelationsResponse getSquareMemberRelations(
        1: GetSquareMemberRelationsRequest request) throws(1: SquareException e);
    
    GetSquareChatMembersResponse getSquareChatMembers(
        1: GetSquareChatMembersRequest request) throws(1: SquareException e);
    
    GetSquareChatStatusResponse getSquareChatStatus(
        1: GetSquareChatStatusRequest request) throws(1: SquareException e);
    
    GetSquareChatResponse getSquareChat(
        1: GetSquareChatRequest request) throws(1: SquareException e);

    GetSquareResponse getSquare(
        1: GetSquareRequest request) throws(1: SquareException e);

    GetJoinedSquaresResponse getJoinedSquares(
        1: GetJoinedSquaresRequest request) throws(1: SquareException e);

    GetJoinedSquareChatsResponse getJoinedSquareChats(
        1: GetJoinedSquareChatsRequest request) throws(1: SquareException e);

    ApproveSquareMembersResponse approveSquareMembers(
        1: ApproveSquareMembersRequest request) throws(1: SquareException e);
    
    CreateSquareChatResponse createSquareChat(
        1: CreateSquareChatRequest request) throws(1: SquareException e);
    
    CreateSquareResponse createSquare(
        1: CreateSquareRequest request) throws(1: SquareException e);
    
    DeleteSquareChatResponse deleteSquareChat(
        1: DeleteSquareChatRequest request) throws(1: SquareException e);
    
    DeleteSquareResponse deleteSquare(
        1: DeleteSquareRequest request) throws(1: SquareException e);
    
    DestroyMessageResponse destroyMessage(
        1: DestroyMessageRequest request) throws(1: SquareException e);

    GetJoinableSquareChatsResponse getJoinableSquareChats(
        1: GetJoinableSquareChatsRequest request) throws(1: SquareException e);
    
    GetInvitationTicketUrlResponse getInvitationTicketUrl(
        1: GetInvitationTicketUrlRequest request) throws(1: SquareException e);

    FindSquareByInvitationTicketResponse findSquareByInvitationTicket(
        1: FindSquareByInvitationTicketRequest request) throws(1: SquareException e);
    
}
