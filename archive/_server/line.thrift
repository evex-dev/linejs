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



enum ApplicationType {
    IOS                    = 16,
    IOS_RC                 = 17,
    IOS_BETA               = 18,
    IOS_ALPHA              = 19,
    ANDROID                = 32,
    ANDROID_RC             = 33,
    ANDROID_BETA           = 34,
    ANDROID_ALPHA          = 35,
    WAP                    = 48,
    WAP_RC                 = 49,
    WAP_BETA               = 50,
    WAP_ALPHA              = 51,
    BOT                    = 64,
    BOT_RC                 = 65,
    BOT_BETA               = 66,
    BOT_ALPHA              = 67,
    WEB                    = 80,
    WEB_RC                 = 81,
    WEB_BETA               = 82,
    WEB_ALPHA              = 83,
    DESKTOPWIN             = 96,
    DESKTOPWIN_RC          = 97,
    DESKTOPWIN_BETA        = 98,
    DESKTOPWIN_ALPHA       = 99,
    DESKTOPMAC             = 112,
    DESKTOPMAC_RC          = 113,
    DESKTOPMAC_BETA        = 114,
    DESKTOPMAC_ALPHA       = 115,
    CHANNELGW              = 128,
    CHANNELGW_RC           = 129,
    CHANNELGW_BETA         = 130,
    CHANNELGW_ALPHA        = 131,
    CHANNELCP              = 144,
    CHANNELCP_RC           = 145,
    CHANNELCP_BETA         = 146,
    CHANNELCP_ALPHA        = 147,
    WINPHONE               = 160,
    WINPHONE_RC            = 161,
    WINPHONE_BETA          = 162,
    WINPHONE_ALPHA         = 163,
    BLACKBERRY             = 176,
    BLACKBERRY_RC          = 177,
    BLACKBERRY_BETA        = 178,
    BLACKBERRY_ALPHA       = 179,
    WINMETRO               = 192,
    WINMETRO_RC            = 193,
    WINMETRO_BETA          = 194,
    WINMETRO_ALPHA         = 195,
    S40                    = 208,
    S40_RC                 = 209,
    S40_BETA               = 210,
    S40_ALPHA              = 211,
    CHRONO                 = 224,
    CHRONO_RC              = 225,
    CHRONO_BETA            = 226,
    CHRONO_ALPHA           = 227,
    TIZEN                  = 256,
    TIZEN_RC               = 257,
    TIZEN_BETA             = 258,
    TIZEN_ALPHA            = 259,
    VIRTUAL                = 272,
    FIREFOXOS              = 288,
    FIREFOXOS_RC           = 289,
    FIREFOXOS_BETA         = 290,
    FIREFOXOS_ALPHA        = 291,
    IOSIPAD                = 304,
    IOSIPAD_RC             = 305,
    IOSIPAD_BETA           = 306,
    IOSIPAD_ALPHA          = 307,
    BIZIOS                 = 320,
    BIZIOS_RC              = 321,
    BIZIOS_BETA            = 322,
    BIZIOS_ALPHA           = 323,
    BIZANDROID             = 336,
    BIZANDROID_RC          = 337,
    BIZANDROID_BETA        = 338,
    BIZANDROID_ALPHA       = 339,
    BIZBOT                 = 352,
    BIZBOT_RC              = 353,
    BIZBOT_BETA            = 354,
    BIZBOT_ALPHA           = 355,
    CHROMEOS               = 368,
    CHROMEOS_RC            = 369,
    CHROMEOS_BETA          = 370,
    CHROMEOS_ALPHA         = 371,
    ANDROIDLITE            = 384,
    ANDROIDLITE_RC         = 385,
    ANDROIDLITE_BETA       = 386,
    ANDROIDLITE_ALPHA      = 387,
    WIN10                  = 400,
    WIN10_RC               = 401,
    WIN10_BETA             = 402,
    WIN10_ALPHA            = 403,
    BIZWEB                 = 416,
    BIZWEB_RC              = 417,
    BIZWEB_BETA            = 418,
    BIZWEB_ALPHA           = 419,
    DUMMYPRIMARY           = 432,
    DUMMYPRIMARY_RC        = 433,
    DUMMYPRIMARY_BETA      = 434,
    DUMMYPRIMARY_ALPHA     = 435,
    SQUARE                 = 448,
    SQUARE_RC              = 449,
    SQUARE_BETA            = 450,
    SQUARE_ALPHA           = 451,
    INTERNAL               = 464,
    INTERNAL_RC            = 465,
    INTERNAL_BETA          = 466,
    INTERNAL_ALPHA         = 467,
    CLOVAFRIENDS           = 480,
    CLOVAFRIENDS_RC        = 481,
    CLOVAFRIENDS_BETA      = 482,
    CLOVAFRIENDS_ALPHA     = 483,
    WATCHOS                = 496,
    WATCHOS_RC             = 497,
    WATCHOS_BETA           = 498,
    WATCHOS_ALPHA          = 499,
    OPENCHAT_PLUG          = 512,
    OPENCHAT_PLUG_RC       = 513,
    OPENCHAT_PLUG_BETA     = 514,
    OPENCHAT_PLUG_ALPHA    = 515,
    ANDROIDSECONDARY       = 528,
    ANDROIDSECONDARY_RC    = 529,
    ANDROIDSECONDARY_BETA  = 530,
    ANDROIDSECONDARY_ALPHA = 531,
    WEAROS                 = 544,
    WEAROS_RC              = 545,
    WEAROS_BETA            = 546,
    WEAROS_ALPHA           = 547,
}

enum ErrorCode {
    ILLEGAL_ARGUMENT                                      = 0,
    AUTHENTICATION_FAILED                                 = 1,
    DB_FAILED                                             = 2,
    INVALID_STATE                                         = 3,
    EXCESSIVE_ACCESS                                      = 4,
    NOT_FOUND                                             = 5,
    INVALID_LENGTH                                        = 6,
    NOT_AVAILABLE_USER                                    = 7,
    NOT_AUTHORIZED_DEVICE                                 = 8,
    INVALID_MID                                           = 9,
    NOT_A_MEMBER                                          = 10,
    INCOMPATIBLE_APP_VERSION                              = 11,
    NOT_READY                                             = 12,
    NOT_AVAILABLE_SESSION                                 = 13,
    NOT_AUTHORIZED_SESSION                                = 14,
    SYSTEM_ERROR                                          = 15,
    NO_AVAILABLE_VERIFICATION_METHOD                      = 16,
    NOT_AUTHENTICATED                                     = 17,
    INVALID_IDENTITY_CREDENTIAL                           = 18,
    NOT_AVAILABLE_IDENTITY_IDENTIFIER                     = 19,
    INTERNAL_ERROR                                        = 20,
    NO_SUCH_IDENTITY_IDENFIER                             = 21,
    DEACTIVATED_ACCOUNT_BOUND_TO_THIS_IDENTITY            = 22,
    ILLEGAL_IDENTITY_CREDENTIAL                           = 23,
    UNKNOWN_CHANNEL                                       = 24,
    NO_SUCH_MESSAGE_BOX                                   = 25,
    NOT_AVAILABLE_MESSAGE_BOX                             = 26,
    CHANNEL_DOES_NOT_MATCH                                = 27,
    NOT_YOUR_MESSAGE                                      = 28,
    MESSAGE_DEFINED_ERROR                                 = 29,
    USER_CANNOT_ACCEPT_PRESENTS                           = 30,
    USER_NOT_STICKER_OWNER                                = 32,
    MAINTENANCE_ERROR                                     = 33,
    ACCOUNT_NOT_MATCHED                                   = 34,
    ABUSE_BLOCK                                           = 35,
    NOT_FRIEND                                            = 36,
    NOT_ALLOWED_CALL                                      = 37,
    BLOCK_FRIEND                                          = 38,
    INCOMPATIBLE_VOIP_VERSION                             = 39,
    INVALID_SNS_ACCESS_TOKEN                              = 40,
    EXTERNAL_SERVICE_NOT_AVAILABLE                        = 41,
    NOT_ALLOWED_ADD_CONTACT                               = 42,
    NOT_CERTIFICATED                                      = 43,
    NOT_ALLOWED_SECONDARY_DEVICE                          = 44,
    INVALID_PIN_CODE                                      = 45,
    NOT_FOUND_IDENTITY_CREDENTIAL                         = 46,
    EXCEED_FILE_MAX_SIZE                                  = 47,
    EXCEED_DAILY_QUOTA                                    = 48,
    NOT_SUPPORT_SEND_FILE                                 = 49,
    MUST_UPGRADE                                          = 50,
    NOT_AVAILABLE_PIN_CODE_SESSION                        = 51,
    EXPIRED_REVISION                                      = 52,
    NOT_YET_PHONE_NUMBER                                  = 54,
    BAD_CALL_NUMBER                                       = 55,
    UNAVAILABLE_CALL_NUMBER                               = 56,
    NOT_SUPPORT_CALL_SERVICE                              = 57,
    CONGESTION_CONTROL                                    = 58,
    NO_BALANCE                                            = 59,
    NOT_PERMITTED_CALLER_ID                               = 60,
    NO_CALLER_ID_LIMIT_EXCEEDED                           = 61,
    CALLER_ID_VERIFICATION_REQUIRED                       = 62,
    NO_CALLER_ID_LIMIT_EXCEEDED_AND_VERIFICATION_REQUIRED = 63,
    MESSAGE_NOT_FOUND                                     = 64,
    INVALID_ACCOUNT_MIGRATION_PINCODE_FORMAT              = 65,
    ACCOUNT_MIGRATION_PINCODE_NOT_MATCHED                 = 66,
    ACCOUNT_MIGRATION_PINCODE_BLOCKED                     = 67,
    INVALID_PASSWORD_FORMAT                               = 69,
    FEATURE_RESTRICTED                                    = 70,
    MESSAGE_NOT_DESTRUCTIBLE                              = 71,
    PAID_CALL_REDEEM_FAILED                               = 72,
    PREVENTED_JOIN_BY_TICKET                              = 73,
    SEND_MESSAGE_NOT_PERMITTED_FROM_LINE_AT               = 75,
    SEND_MESSAGE_NOT_PERMITTED_WHILE_AUTO_REPLY           = 76,
    SECURITY_CENTER_NOT_VERIFIED                          = 77,
    SECURITY_CENTER_BLOCKED_BY_SETTING                    = 78,
    SECURITY_CENTER_BLOCKED                               = 79,
    TALK_PROXY_EXCEPTION                                  = 80,
    E2EE_INVALID_PROTOCOL                                 = 81,
    E2EE_RETRY_ENCRYPT                                    = 82,
    E2EE_UPDATE_SENDER_KEY                                = 83,
    E2EE_UPDATE_RECEIVER_KEY                              = 84,
    E2EE_INVALID_ARGUMENT                                 = 85,
    E2EE_INVALID_VERSION                                  = 86,
    E2EE_SENDER_DISABLED                                  = 87,
    E2EE_RECEIVER_DISABLED                                = 88,
    E2EE_SENDER_NOT_ALLOWED                               = 89,
    E2EE_RECEIVER_NOT_ALLOWED                             = 90,
    E2EE_RESEND_FAIL                                      = 91,
    E2EE_RESEND_OK                                        = 92,
    HITOKOTO_BACKUP_NO_AVAILABLE_DATA                     = 93,
    E2EE_UPDATE_PRIMARY_DEVICE                            = 94,
    SUCCESS                                               = 95,
    CANCEL                                                = 96,
    E2EE_PRIMARY_NOT_SUPPORT                              = 97,
    E2EE_RETRY_PLAIN                                      = 98,
    E2EE_RECREATE_GROUP_KEY                               = 99,
    E2EE_GROUP_TOO_MANY_MEMBERS                           = 100,
    SERVER_BUSY                                           = 101,
    NOT_ALLOWED_ADD_FOLLOW                                = 102,
    INCOMING_FRIEND_REQUEST_LIMIT                         = 103,
    OUTGOING_FRIEND_REQUEST_LIMIT                         = 104,
    OUTGOING_FRIEND_REQUEST_QUOTA                         = 105,
    DUPLICATED                                            = 106,
    BANNED                                                = 107,
    NOT_AN_INVITEE                                        = 108,
    NOT_AN_OUTSIDER                                       = 109,
    EMPTY_GROUP                                           = 111,
    EXCEED_FOLLOW_LIMIT                                   = 112,
    UNSUPPORTED_ACCOUNT_TYPE                              = 113,
    AGREEMENT_REQUIRED                                    = 114,
    SHOULD_RETRY                                          = 115,
    OVER_MAX_CHATS_PER_USER                               = 116,
    NOT_AVAILABLE_API                                     = 117,
    INVALID_OTP                                           = 118,
    MUST_REFRESH_V3_TOKEN                                 = 119,
    ALREADY_EXPIRED                                       = 120,
    USER_NOT_STICON_OWNER                                 = 121,
    REFRESH_MEDIA_FLOW                                    = 122,
    EXCEED_FOLLOWER_LIMIT                                 = 123,
}

enum LiffErrorCode {
    INVALID_REQUEST                  = 1,
    UNAUTHORIZED                     = 2,
    CONSENT_REQUIRED                 = 3,
    VERSION_UPDATE_REQUIRED          = 4,
    COMPREHENSIVE_AGREEMENT_REQUIRED = 5,
    SPLASH_SCREEN_REQUIRED           = 6,
    SERVER_ERROR                     = 100,
}

enum ChannelErrorCode {
    ILLEGAL_ARGUMENT         = 0,
    INTERNAL_ERROR           = 1,
    CONNECTION_ERROR         = 2,
    AUTHENTICATIONI_FAILED   = 3,
    NEED_PERMISSION_APPROVAL = 4,
    COIN_NOT_USABLE          = 5,
    WEBVIEW_NOT_ALLOWED      = 6,
}

enum PreconditionFailedExtraInfo {
    DUPLICATED_DISPLAY_NAME = 0,
}

enum SquareErrorCode {
    UNKNOWN                = 0,
    INTERNAL_ERROR         = 500,
    NOT_IMPLEMENTED        = 501,
    TRY_AGAIN_LATER        = 503,
    MAINTENANCE            = 505,
    NO_PRESENCE_EXISTS     = 506,
    ILLEGAL_ARGUMENT       = 400,
    AUTHENTICATION_FAILURE = 401,
    FORBIDDEN              = 403,
    NOT_FOUND              = 404,
    REVISION_MISMATCH      = 409,
    PRECONDITION_FAILED    = 410,
}

enum HomeExceptionCode {
    INTERNAL_ERROR              = 0,
    ILLEGAL_ARGUMENT            = 1,
    VERIFICATION_FAILED         = 2,
    NOT_FOUND                   = 3,
    RETRY_LATER                 = 4,
    HUMAN_VERIFICATION_REQUIRED = 5,
    INVALID_CONTEXT             = 100,
    APP_UPGRADE_REQUIRED        = 101,
    NO_CONTENT                  = 102,
}

enum ChatappErrorCode {
    INVALID_REQUEST = 1,
    UNAUTHORIZED    = 2,
    SERVER_ERROR    = 100,
}

enum MembershipErrorCode {
    ILLEGAL_ARGUMENT      = 0,
    AUTHENTICATION_FAILED = 1,
    NOT_FOUND             = 5,
    INTERNAL_ERROR        = 20,
    MAINTENANCE_ERROR     = 33,
}

enum BotErrorCode {
    UNKNOWN               = 0,
    BOT_NOT_FOUND         = 1,
    BOT_NOT_AVAILABLE     = 2,
    NOT_A_MEMBER          = 3,
    AUTHENTICATION_FAILED = 401,
    ILLEGAL_ARGUMENT      = 400,
    INTERNAL_ERROR        = 500,
}

enum BotExternalErrorCode {
    ILLEGAL_ARGUMENT = 0,
    INTERNAL_ERROR   = 1,
}

enum AccessTokenRefreshErrorCode {
    INVALID_REQUEST = 1000,
    RETRY_REQUIRED  = 1001,
}

enum AccountEapConnectErrorCode {
    INTERNAL_ERROR              = 0,
    ILLEGAL_ARGUMENT            = 1,
    VERIFICATION_FAILED         = 2,
    RETRY_LATER                 = 4,
    HUMAN_VERIFICATION_REQUIRED = 5,
    APP_UPGRADE_REQUIRED        = 101,
}

enum PwlessCredentialErrorCode {
    INTERNAL_ERROR                        = 0,
    ILLEGAL_ARGUMENT                      = 1,
    VERIFICATION_FAILED                   = 2,
    EXTERNAL_SERVICE_UNAVAILABLE          = 3,
    RETRY_LATER                           = 4,
    INVALID_CONTEXT                       = 100,
    NOT_SUPPORTED                         = 101,
    FORBIDDEN                             = 102,
    FIDO_RETRY_WITH_ANOTHER_AUTHENTICATOR = 201,
}

enum SecondAuthFactorPinCodeErrorCode {
    INTERNAL_ERROR       = 0,
    ILLEGAL_ARGUMENT     = 1,
    VERIFICATION_FAILED  = 2,
    RETRY_LATER          = 3,
    INVALID_CONTEXT      = 100,
    APP_UPGRADE_REQUIRED = 101,
}

enum AuthErrorCode {
    INTERNAL_ERROR              = 0,
    ILLEGAL_ARGUMENT            = 1,
    VERIFICATION_FAILED         = 2,
    NOT_FOUND                   = 3,
    RETRY_LATER                 = 4,
    HUMAN_VERIFICATION_REQUIRED = 5,
    INVALID_CONTEXT             = 100,
    APP_UPGRADE_REQUIRED        = 101,
}

enum SecondaryPwlessLoginErrorCode {
    INTERNAL_ERROR                        = 0,
    VERIFICATION_FAILED                   = 1,
    LOGIN_NOT_ALLOWED                     = 2,
    EXTERNAL_SERVICE_UNAVAILABLE          = 3,
    RETRY_LATER                           = 4,
    NOT_SUPPORTED                         = 100,
    ILLEGAL_ARGUMENT                      = 101,
    INVALID_CONTEXT                       = 102,
    FORBIDDEN                             = 103,
    FIDO_UNKNOWN_CREDENTIAL_ID            = 200,
    FIDO_RETRY_WITH_ANOTHER_AUTHENTICATOR = 201,
    FIDO_UNACCEPTABLE_CONTENT             = 202,
}

enum SecondaryQrCodeErrorCode {
    INTERNAL_ERROR             = 0,
    ILLEGAL_ARGUMENT           = 1,
    VERIFICATION_FAILED        = 2,
    NOT_ALLOWED_QR_CODE_LOGIN  = 3,
    VERIFICATION_NOTICE_FAILED = 4,
    RETRY_LATER                = 5,
    INVALID_CONTEXT            = 100,
    APP_UPGRADE_REQUIRED       = 101,
}

enum PaymentErrorCode {
    SUCCESS                       = 0,
    GENERAL_USER_ERROR            = 1000,
    ACCOUNT_NOT_EXISTS            = 1101,
    ACCOUNT_INVALID_STATUS        = 1102,
    ACCOUNT_ALREADY_EXISTS        = 1103,
    MERCHANT_NOT_EXISTS           = 1104,
    MERCHANT_INVALID_STATUS       = 1105,
    AGREEMENT_REQUIRED            = 1107,
    BLACKLISTED                   = 1108,
    WRONG_PASSWORD                = 1109,
    INVALID_CREDIT_CARD           = 1110,
    LIMIT_EXCEEDED                = 1111,
    CANNOT_PROCEED                = 1115,
    TOO_WEAK_PASSWORD             = 1120,
    CANNOT_CREATE_ACCOUNT         = 1125,
    TEMPORARY_PASSWORD_ERROR      = 1130,
    MISSING_PARAMETERS            = 1140,
    NO_VALID_MYCODE_ACCOUNT       = 1141,
    INSUFFICIENT_BALANCE          = 1142,
    TRANSACTION_NOT_FOUND         = 1150,
    TRANSACTION_FINISHED          = 1152,
    PAYMENT_AMOUNT_WRONG          = 1153,
    BALANCE_ACCOUNT_NOT_EXISTS    = 1157,
    DUPLICATED_CITIZEN_ID         = 1158,
    PAYMENT_REQUEST_NOT_FOUND     = 1159,
    AUTH_FAILED                   = 1169,
    PASSWORD_SETTING_REQUIRED     = 1171,
    TRANSACTION_ALREADY_PROCESSED = 1172,
    CURRENCY_NOT_SUPPORTED        = 1178,
    PAYMENT_NOT_AVAILABLE         = 1180,
    TRANSFER_REQUEST_NOT_FOUND    = 1181,
    INVALID_PAYMENT_AMOUNT        = 1183,
    INSUFFICIENT_PAYMENT_AMOUNT   = 1184,
    EXTERNAL_SYSTEM_MAINTENANCE   = 1185,
    EXTERNAL_SYSTEM_INOPERATIONAL = 1186,
    SESSION_EXPIRED               = 1192,
    UPGRADE_REQUIRED              = 1195,
    REQUEST_TOKEN_EXPIRED         = 1196,
    OPERATION_FINISHED            = 1198,
    EXTERNAL_SYSTEM_ERROR         = 1199,
    PARTIAL_AMOUNT_APPROVED       = 1299,
    PINCODE_AUTH_REQUIRED         = 1600,
    ADDITIONAL_AUTH_REQUIRED      = 1601,
    NOT_BOUND                     = 1603,
    OTP_USER_REGISTRATION_ERROR   = 1610,
    OTP_CARD_REGISTRATION_ERROR   = 1611,
    NO_AUTH_METHOD                = 1612,
    GENERAL_USER_ERROR_RESTART    = 1696,
    GENERAL_USER_ERROR_REFRESH    = 1697,
    GENERAL_USER_ERROR_CLOSE      = 1698,
    INTERNAL_SERVER_ERROR         = 9000,
    INTERNAL_SYSTEM_MAINTENANCE   = 9999,
    UNKNOWN_ERROR                 = 10000,
}

enum SettingsErrorCode {
    UNKNOWN                      = 0,
    NONE                         = 1,
    ILLEGAL_ARGUMENT             = 16641,
    NOT_FOUND                    = 16642,
    NOT_AVAILABLE                = 16643,
    TOO_LARGE_VALUE              = 16644,
    CLOCK_DRIFT_DETECTED         = 16645,
    UNSUPPORTED_APPLICATION_TYPE = 16646,
    DUPLICATED_ENTRY             = 16647,
    AUTHENTICATION_FAILED        = 16897,
    INTERNAL_SERVER_ERROR        = 20737,
    SERVICE_IN_MAINTENANCE_MODE  = 20738,
    SERVICE_UNAVAILABLE          = 20739,
}

enum ThingsErrorCode {
    INTERNAL_SERVER_ERROR = 0,
    UNAUTHORIZED          = 1,
    INVALID_REQUEST       = 2,
    INVALID_STATE         = 3,
    DEVICE_LIMIT_EXCEEDED = 4096,
    UNSUPPORTED_REGION    = 4097,
}

enum SuggestTrialErrorCode {
    UNKNOWN               = 0,
    NONE                  = 1,
    ILLEGAL_ARGUMENT      = 16641,
    NOT_FOUND             = 16642,
    NOT_AVAILABLE         = 16643,
    AUTHENTICATION_FAILED = 16897,
    INTERNAL_SERVER_ERROR = 20737,
    SERVICE_UNAVAILABLE   = 20739,
}

enum LFLPremiumErrorCode {
    ILLEGAL_ARGUMENT            = 16641,
    MAJOR_VERSION_NOT_SUPPORTED = 16642,
    AUTHENTICATION_FAILED       = 16897,
    INTERNAL_SERVER_ERROR       = 20737,
}

enum WalletErrorCode {
    INVALID_PARAMETER           = 400,
    AUTHENTICATION_FAILED       = 401,
    INTERNAL_SERVER_ERROR       = 500,
    SERVICE_IN_MAINTENANCE_MODE = 503,
}

enum ShopErrorCode {
    UNKNOWN                      = 0,
    NONE                         = 1,
    ILLEGAL_ARGUMENT             = 16641,
    NOT_FOUND                    = 16642,
    NOT_AVAILABLE                = 16643,
    NOT_PAID_PRODUCT             = 16644,
    NOT_FREE_PRODUCT             = 16645,
    ALREADY_OWNED                = 16646,
    ERROR_WITH_CUSTOM_MESSAGE    = 16647,
    NOT_AVAILABLE_TO_RECIPIENT   = 16648,
    NOT_AVAILABLE_FOR_CHANNEL_ID = 16649,
    NOT_SALE_FOR_COUNTRY         = 16650,
    NOT_SALES_PERIOD             = 16651,
    NOT_SALE_FOR_DEVICE          = 16652,
    NOT_SALE_FOR_VERSION         = 16653,
    ALREADY_EXPIRED              = 16654,
    LIMIT_EXCEEDED               = 16655,
    MISSING_CAPABILITY           = 16656,
    AUTHENTICATION_FAILED        = 16897,
    BALANCE_SHORTAGE             = 17153,
    INTERNAL_SERVER_ERROR        = 20737,
    SERVICE_IN_MAINTENANCE_MODE  = 20738,
    SERVICE_UNAVAILABLE          = 20739,
}

enum PointErrorCode {
    REQUEST_DUPLICATION               = 3001,
    INVALID_PARAMETER                 = 3002,
    NOT_ENOUGH_BALANCE                = 3003,
    AUTHENTICATION_FAIL               = 3004,
    API_ACCESS_FORBIDDEN              = 3005,
    MEMBER_ACCOUNT_NOT_FOUND          = 3006,
    SERVICE_ACCOUNT_NOT_FOUND         = 3007,
    TRANSACTION_NOT_FOUND             = 3008,
    ALREADY_REVERSED_TRANSACTION      = 3009,
    MESSAGE_NOT_READABLE              = 3010,
    HTTP_REQUEST_METHOD_NOT_SUPPORTED = 3011,
    HTTP_MEDIA_TYPE_NOT_SUPPORTED     = 3012,
    NOT_ALLOWED_TO_DEPOSIT            = 3013,
    NOT_ALLOWED_TO_PAY                = 3014,
    TRANSACTION_ACCESS_FORBIDDEN      = 3015,
    INVALID_SERVICE_CONFIGURATION     = 4001,
    DCS_COMMUNICATION_FAIL            = 5004,
    UPDATE_BALANCE_FAIL               = 5007,
    SYSTEM_MAINTENANCE                = 5888,
    SYSTEM_ERROR                      = 5999,
}

enum E2EEKeyBackupErrorCode {
    ILLEGAL_ARGUMENT      = 0,
    AUTHENTICATION_FAILED = 1,
    INTERNAL_ERROR        = 2,
    RESTORE_KEY_FIRST     = 3,
    NO_BACKUP             = 4,
    LOCKOUT               = 5,
    INVALID_PIN           = 6,
}

enum TalkSyncReason {
    UNSPECIFIED    = 0,
    UNKNOWN        = 1,
    INITIALIZATION = 2,
    OPERATION      = 3,
    FULL_SYNC      = 4,
    AUTO_REPAIR    = 5,
    MANUAL_REPAIR  = 6,
    INTERNAL       = 7,
    USER_INITIATED = 8,
}

enum OpType {
    END_OF_OPERATION                    = 0,
    UPDATE_PROFILE                      = 1,
    NOTIFIED_UPDATE_PROFILE             = 2,
    REGISTER_USERID                     = 3,
    ADD_CONTACT                         = 4,
    NOTIFIED_ADD_CONTACT                = 5,
    BLOCK_CONTACT                       = 6,
    UNBLOCK_CONTACT                     = 7,
    NOTIFIED_RECOMMEND_CONTACT          = 8,
    CREATE_GROUP                        = 9,
    UPDATE_GROUP                        = 10,
    NOTIFIED_UPDATE_GROUP               = 11,
    INVITE_INTO_GROUP                   = 12,
    NOTIFIED_INVITE_INTO_GROUP          = 13,
    LEAVE_GROUP                         = 14,
    NOTIFIED_LEAVE_GROUP                = 15,
    ACCEPT_GROUP_INVITATION             = 16,
    NOTIFIED_ACCEPT_GROUP_INVITATION    = 17,
    KICKOUT_FROM_GROUP                  = 18,
    NOTIFIED_KICKOUT_FROM_GROUP         = 19,
    CREATE_ROOM                         = 20,
    INVITE_INTO_ROOM                    = 21,
    NOTIFIED_INVITE_INTO_ROOM           = 22,
    LEAVE_ROOM                          = 23,
    NOTIFIED_LEAVE_ROOM                 = 24,
    SEND_MESSAGE                        = 25,
    RECEIVE_MESSAGE                     = 26,
    SEND_MESSAGE_RECEIPT                = 27,
    RECEIVE_MESSAGE_RECEIPT             = 28,
    SEND_CONTENT_RECEIPT                = 29,
    RECEIVE_ANNOUNCEMENT                = 30,
    CANCEL_INVITATION_GROUP             = 31,
    NOTIFIED_CANCEL_INVITATION_GROUP    = 32,
    NOTIFIED_UNREGISTER_USER            = 33,
    REJECT_GROUP_INVITATION             = 34,
    NOTIFIED_REJECT_GROUP_INVITATION    = 35,
    UPDATE_SETTINGS                     = 36,
    NOTIFIED_REGISTER_USER              = 37,
    INVITE_VIA_EMAIL                    = 38,
    NOTIFIED_REQUEST_RECOVERY           = 39,
    SEND_CHAT_CHECKED                   = 40,
    SEND_CHAT_REMOVED                   = 41,
    NOTIFIED_FORCE_SYNC                 = 42,
    SEND_CONTENT                        = 43,
    SEND_MESSAGE_MYHOME                 = 44,
    NOTIFIED_UPDATE_CONTENT_PREVIEW     = 45,
    REMOVE_ALL_MESSAGES                 = 46,
    NOTIFIED_UPDATE_PURCHASES           = 47,
    DUMMY                               = 48,
    UPDATE_CONTACT                      = 49,
    NOTIFIED_RECEIVED_CALL              = 50,
    CANCEL_CALL                         = 51,
    NOTIFIED_REDIRECT                   = 52,
    NOTIFIED_CHANNEL_SYNC               = 53,
    FAILED_SEND_MESSAGE                 = 54,
    NOTIFIED_READ_MESSAGE               = 55,
    FAILED_EMAIL_CONFIRMATION           = 56,
    NOTIFIED_CHAT_CONTENT               = 58,
    NOTIFIED_PUSH_NOTICENTER_ITEM       = 59,
    NOTIFIED_JOIN_CHAT                  = 60,
    NOTIFIED_LEAVE_CHAT                 = 61,
    NOTIFIED_TYPING                     = 62,
    FRIEND_REQUEST_ACCEPTED             = 63,
    DESTROY_MESSAGE                     = 64,
    NOTIFIED_DESTROY_MESSAGE            = 65,
    UPDATE_PUBLICKEYCHAIN               = 66,
    NOTIFIED_UPDATE_PUBLICKEYCHAIN      = 67,
    NOTIFIED_BLOCK_CONTACT              = 68,
    NOTIFIED_UNBLOCK_CONTACT            = 69,
    UPDATE_GROUPPREFERENCE              = 70,
    NOTIFIED_PAYMENT_EVENT              = 71,
    REGISTER_E2EE_PUBLICKEY             = 72,
    NOTIFIED_E2EE_KEY_EXCHANGE_REQ      = 73,
    NOTIFIED_E2EE_KEY_EXCHANGE_RESP     = 74,
    NOTIFIED_E2EE_MESSAGE_RESEND_REQ    = 75,
    NOTIFIED_E2EE_MESSAGE_RESEND_RESP   = 76,
    NOTIFIED_E2EE_KEY_UPDATE            = 77,
    NOTIFIED_BUDDY_UPDATE_PROFILE       = 78,
    NOTIFIED_UPDATE_LINEAT_TABS         = 79,
    UPDATE_ROOM                         = 80,
    NOTIFIED_BEACON_DETECTED            = 81,
    UPDATE_EXTENDED_PROFILE             = 82,
    ADD_FOLLOW                          = 83,
    NOTIFIED_ADD_FOLLOW                 = 84,
    DELETE_FOLLOW                       = 85,
    NOTIFIED_DELETE_FOLLOW              = 86,
    UPDATE_TIMELINE_SETTINGS            = 87,
    NOTIFIED_FRIEND_REQUEST             = 88,
    UPDATE_RINGBACK_TONE                = 89,
    NOTIFIED_POSTBACK                   = 90,
    RECEIVE_READ_WATERMARK              = 91,
    NOTIFIED_MESSAGE_DELIVERED          = 92,
    NOTIFIED_UPDATE_CHAT_BAR            = 93,
    NOTIFIED_CHATAPP_INSTALLED          = 94,
    NOTIFIED_CHATAPP_UPDATED            = 95,
    NOTIFIED_CHATAPP_NEW_MARK           = 96,
    NOTIFIED_CHATAPP_DELETED            = 97,
    NOTIFIED_CHATAPP_SYNC               = 98,
    NOTIFIED_UPDATE_MESSAGE             = 99,
    UPDATE_CHATROOMBGM                  = 100,
    NOTIFIED_UPDATE_CHATROOMBGM         = 101,
    UPDATE_RINGTONE                     = 102,
    UPDATE_USER_SETTINGS                = 118,
    NOTIFIED_UPDATE_STATUS_BAR          = 119,
    CREATE_CHAT                         = 120,
    UPDATE_CHAT                         = 121,
    NOTIFIED_UPDATE_CHAT                = 122,
    INVITE_INTO_CHAT                    = 123,
    NOTIFIED_INVITE_INTO_CHAT           = 124,
    CANCEL_CHAT_INVITATION              = 125,
    NOTIFIED_CANCEL_CHAT_INVITATION     = 126,
    DELETE_SELF_FROM_CHAT               = 127,
    NOTIFIED_DELETE_SELF_FROM_CHAT      = 128,
    ACCEPT_CHAT_INVITATION              = 129,
    NOTIFIED_ACCEPT_CHAT_INVITATION     = 130,
    REJECT_CHAT_INVITATION              = 131,
    DELETE_OTHER_FROM_CHAT              = 132,
    NOTIFIED_DELETE_OTHER_FROM_CHAT     = 133,
    NOTIFIED_CONTACT_CALENDAR_EVENT     = 134,
    NOTIFIED_CONTACT_CALENDAR_EVENT_ALL = 135,
    UPDATE_THINGS_OPERATIONS            = 136,
    SEND_CHAT_HIDDEN                    = 137,
    CHAT_META_SYNC_ALL                  = 138,
    SEND_REACTION                       = 139,
    NOTIFIED_SEND_REACTION              = 140,
    NOTIFIED_UPDATE_PROFILE_CONTENT     = 141,
    FAILED_DELIVERY_MESSAGE             = 142,
}

enum OpStatus {
    NORMAL         = 0,
    ALERT_DISABLED = 1,
    ALWAYS         = 2,
}

enum MIDType {
    USER          = 0,
    ROOM          = 1,
    GROUP         = 2,
    SQUARE        = 3,
    SQUARE_CHAT   = 4,
    SQUARE_MEMBER = 5,
    BOT           = 6,
}

enum MessageRelationType {
    FORWARD     = 0,
    AUTO_REPLY  = 1,
    SUBORDINATE = 2,
    REPLY       = 3,
}

enum ServiceCode {
    UNKNOWN = 0,
    TALK    = 1,
    SQUARE  = 2,
}

enum AppExtensionType {
    SIRI             = 1,
    GOOGLE_ASSISTANT = 2,
    OS_SHARE         = 3,
}

enum PredefinedReactionType {
    NICE    = 2,
    LOVE    = 3,
    FUN     = 4,
    AMAZING = 5,
    SAD     = 6,
    OMG     = 7,
}

enum PlaceSearchProvider {
    GOOGLE     = 0,
    BAIDU      = 1,
    FOURSQUARE = 2,
}

enum GeolocationAccuracyMode {
    UNKNOWN                  = 0,
    IOS_REDUCED_ACCURACY     = 1,
    IOS_FULL_ACCURACY        = 2,
    AOS_PRECISE_LOCATION     = 3,
    AOS_APPROXIMATE_LOCATION = 4,
}

enum ContentType {
    NONE             = 0,
    IMAGE            = 1,
    VIDEO            = 2,
    AUDIO            = 3,
    HTML             = 4,
    PDF              = 5,
    CALL             = 6,
    STICKER          = 7,
    PRESENCE         = 8,
    GIFT             = 9,
    GROUPBOARD       = 10,
    APPLINK          = 11,
    LINK             = 12,
    CONTACT          = 13,
    FILE             = 14,
    LOCATION         = 15,
    POSTNOTIFICATION = 16,
    RICH             = 17,
    CHATEVENT        = 18,
    MUSIC            = 19,
    PAYMENT          = 20,
    EXTIMAGE         = 21,
    FLEX             = 22,
}

enum ContactType {
    MID             = 0,
    PHONE           = 1,
    EMAIL           = 2,
    USERID          = 3,
    PROXIMITY       = 4,
    GROUP           = 5,
    USER            = 6,
    QRCODE          = 7,
    PROMOTION_BOT   = 8,
    CONTACT_MESSAGE = 9,
    FRIEND_REQUEST  = 10,
    BEACON          = 11,
    REPAIR          = 128,
    FACEBOOK        = 2305,
    SINA            = 2306,
    RENREN          = 2307,
    FEIXIN          = 2308,
    BBM             = 2309,
}

enum ContactStatus {
    UNSPECIFIED       = 0,
    FRIEND            = 1,
    FRIEND_BLOCKED    = 2,
    RECOMMEND         = 3,
    RECOMMEND_BLOCKED = 4,
    DELETED           = 5,
    DELETED_BLOCKED   = 6,
}

enum ContactRelation {
    ONEWAY         = 0,
    BOTH           = 1,
    NOT_REGISTERED = 2,
}

enum FriendRequestStatus {
    NONE              = 0,
    AVAILABLE         = 1,
    ALREADY_REQUESTED = 2,
    UNAVAILABLE       = 3,
}

enum ContactCalendarEventType {
    BIRTHDAY = 0,
}

enum UserStatus {
    NORMAL       = 0,
    UNBOUND      = 1,
    UNREGISTERED = 2,
    UNKNOWN      = 3,
}

enum ContactCalendarEventState {
    SHOW = 0,
    HIDE = 1,
}

enum SnsIdType {
    FACEBOOK   = 1,
    SINA       = 2,
    RENREN     = 3,
    FEIXIN     = 4,
    BBM        = 5,
    APPLE      = 6,
    YAHOOJAPAN = 7,
}

enum UserAgeType {
    OVER      = 1,
    UNDER     = 2,
    UNDEFINED = 3,
}

enum UserAllowProfileHistoryType {
    OWNER  = 0,
    FRIEND = 1,
}

enum UserStatusMessageHistoryType {
    NONE = 1,
    ALL  = 2,
}

enum UserSharePersonalInfoToFriendsType {
    NEVER_SHOW = 0,
    ONE_WAY    = 1,
    MUTUAL     = 2,
}

enum IdentityProvider {
    UNKNOWN    = 0,
    LINE       = 1,
    NAVER_KR   = 2,
    LINE_PHONE = 3,
}

enum EmailConfirmationStatus {
    NOT_SPECIFIED       = 0,
    NOT_YET             = 1,
    DONE                = 3,
    NEED_ENFORCED_INPUT = 4,
}

enum AccountMigrationPincodeType {
    NOT_APPLICABLE      = 0,
    NOT_SET             = 1,
    SET                 = 2,
    NEED_ENFORCED_INPUT = 3,
}

enum SecurityCenterSettingsType {
    NOT_APPLICABLE      = 0,
    NOT_SET             = 1,
    SET                 = 2,
    NEED_ENFORCED_INPUT = 3,
}

enum CustomMode {
    PROMOTION_FRIENDS_INVITE            = 1,
    CAPABILITY_SERVER_SIDE_SMS          = 2,
    LINE_CLIENT_ANALYTICS_CONFIGURATION = 3,
}

enum VerificationMethod {
    NO_AVAILABLE    = 0,
    PIN_VIA_SMS     = 1,
    CALLERID_INDIGO = 2,
    PIN_VIA_TTS     = 4,
    SKIP            = 10,
}

enum ContactSetting {
    CONTACT_SETTING_NOTIFICATION_DISABLE  = 1,
    CONTACT_SETTING_DISPLAY_NAME_OVERRIDE = 2,
    CONTACT_SETTING_CONTACT_HIDE          = 4,
    CONTACT_SETTING_FAVORITE              = 8,
    CONTACT_SETTING_DELETE                = 16,
}

enum FriendRequestMethod {
    TIMELINE = 1,
    NEARBY   = 2,
    SQUARE   = 3,
}

enum CharType {
    GROUP = 0,
    ROOM  = 1,
    PEER  = 2,
}

enum FeatureType {
    OBS_VIDEO         = 1,
    OBS_GENERAL       = 2,
    OBS_RINGBACK_TONE = 3,
}

enum NotificationType {
    APPLE_APNS      = 1,
    GOOGLE_C2DM     = 2,
    NHN_NNI         = 3,
    SKT_AOM         = 4,
    MS_MPNS         = 5,
    RIM_BIS         = 6,
    GOOGLE_GCM      = 7,
    NOKIA_NNAPI     = 8,
    TIZEN           = 9,
    MOZILLA_SIMPLE  = 10,
    LINE_BOT        = 17,
    LINE_WAP        = 18,
    APPLE_APNS_VOIP = 19,
    MS_WNS          = 20,
    GOOGLE_FCM      = 21,
    CLOVA           = 22,
    CLOVA_VOIP      = 23,
    HUAWEI_HCM      = 24,
}

enum ModificationType {
    ADD    = 0,
    REMOVE = 1,
    MODIFY = 2,
}

enum ChatAttribute {
    NAME                     = 1,
    PICTURE_STATUS           = 2,
    PREVENTED_JOIN_BY_TICKET = 4,
    NOTIFICATION_SETTING     = 8,
    INVITATION_TICKET        = 16,
    FAVORITE_TIMESTAMP       = 32,
    CHAT_TYPE                = 64,
}

enum BotType {
    RESERVED  = 0,
    OFFICIAL  = 1,
    LINE_AT_0 = 2,
    LINE_AT   = 3,
}

enum BuddyOnAirLabel {
    ON_AIR = 0,
    LIVE   = 1,
    GLP    = 2,
}

enum BuddyBotActiveStatus {
    UNSPECIFIED = 0,
    INACTIVE    = 1,
    ACTIVE      = 2,
    DELETED     = 3,
}

enum GroupCallMediaType {
    AUDIO = 1,
    VIDEO = 2,
    LIVE  = 3,
}

enum GroupCallProtocol {
    STANDARD  = 1,
    CONSTELLA = 2,
}

enum SyncTriggerReason {
    UNKNOWN                       = 0,
    REVISION_GAP_TOO_LARGE_CLIENT = 1,
    REVISION_GAP_TOO_LARGE_SERVER = 2,
    OPERATION_EXPIRED             = 3,
    REVISION_HOLE                 = 4,
    FORCE_TRIGGERED               = 5,
}

enum NotificationStatus {
    NOTIFICATION_ITEM_EXIST        = 1,
    TIMELINE_ITEM_EXIST            = 2,
    NOTE_GROUP_NEW_ITEM_EXIST      = 4,
    TIMELINE_BUDDYGROUP_CHANGED    = 8,
    NOTE_ONE_TO_ONE_NEW_ITEM_EXIST = 16,
    ALBUM_ITEM_EXIST               = 32,
    TIMELINE_ITEM_DELETED          = 64,
    OTOGROUP_ITEM_EXIST            = 128,
    GROUPHOME_NEW_ITEM_EXIST       = 256,
    GROUPHOME_HIDDEN_ITEM_CHANGED  = 512,
    NOTIFICATION_ITEM_CHANGED      = 1024,
    BEAD_ITEM_HIDE                 = 2048,
    BEAD_ITEM_SHOW                 = 4096,
    LINE_TICKET_UPDATED            = 8192,
    TIMELINE_STORY_UPDATED         = 16384,
    SMARTCH_UPDATED                = 32768,
    AVATAR_UPDATED                 = 65536,
    HOME_NOTIFICATION_ITEM_EXIST   = 131072,
    TIMELINE_REBOOT_COMPLETED      = 262144,
    TIMELINE_GUIDE_STORY_UPDATED   = 524288,
}

enum GlobalEventType {
    DUMMY                  = 0,
    NOTICE                 = 1,
    MORETAB                = 2,
    STICKERSHOP            = 3,
    CHANNEL                = 4,
    DENY_KEYWORD           = 5,
    CONNECTIONINFO         = 6,
    BUDDY                  = 7,
    TIMELINEINFO           = 8,
    THEMESHOP              = 9,
    CALLRATE               = 10,
    CONFIGURATION          = 11,
    STICONSHOP             = 12,
    SUGGESTDICTIONARY      = 13,
    SUGGESTSETTINGS        = 14,
    USERSETTINGS           = 15,
    ANALYTICSINFO          = 16,
    SEARCHPOPULARKEYWORD   = 17,
    SEARCHNOTICE           = 18,
    TIMELINE               = 19,
    SEARCHPOPULARCATEGORY  = 20,
    EXTENDEDPROFILE        = 21,
    SEASONALMARKETING      = 22,
    NEWSTAB                = 23,
    SUGGESTDICTIONARYV2    = 24,
    CHATAPPSYNC            = 25,
    AGREEMENTS             = 26,
    INSTANTNEWS            = 27,
    EMOJI_MAPPING          = 28,
    SEARCHBARKEYWORDS      = 29,
    SHOPPING               = 30,
    CHAT_EFFECT_BACKGROUND = 31,
    CHAT_EFFECT_KEYWORD    = 32,
    SEARCHINDEX            = 33,
    HUBTAB                 = 34,
    PAY_RULE_UPDATED       = 35,
    SMARTCH                = 36,
    HOME_SERVICE_LIST      = 37,
    TIMELINESTORY          = 38,
    WALLET_TAB             = 39,
    POD_TAB                = 40,
    HOME_SAFETY_CHECK      = 41,
}

enum SyncCategories {
    ALL            = 0,
    PROFILE        = 1,
    SETTINGS       = 2,
    CONFIGURATIONS = 3,
    CONTACT        = 4,
    GROUP          = 5,
    E2EE           = 6,
    MESSAGE        = 7,
}

enum MediaMessageFlow {
    V1 = 1,
    V2 = 2,
}

enum MessageReactionType {
    ALL     = 0,
    UNDO    = 1,
    NICE    = 2,
    LOVE    = 3,
    FUN     = 4,
    AMAZING = 5,
    SAD     = 6,
    OMG     = 7,
}

enum SquareChatAnnouncementType {
}

enum PictureSource {
    NFT    = 1,
    AVATAR = 2,
    SNOW   = 3,
    ARCZ   = 4,
}

enum RejectionReason {
    UNKNOWN             = 0,
    INVALID_TARGET_USER = 1,
    AGE_VALIDATION      = 2,
    TOO_MANY_FRIENDS    = 3,
    TOO_MANY_REQUESTS   = 4,
    MALFORMED_REQUEST   = 5,
}






exception TalkException {
    1: ErrorCode code;
    2: string reason;
    3: map<string, string> parameterMap;
}


exception ChannelException {
    1: ChannelErrorCode code;
    2: string reason;
    3: map<string, string> parameterMap;
}


exception SquareException {
    1: SquareErrorCode errorCode;
    2: ErrorExtraInfo errorExtraInfo;
    3: string reason;
}


exception LiffException {
    1: LiffErrorCode code;
    2: string message;
    3: LiffErrorPayload payload;
}


exception HomeException {
    1: HomeExceptionCode exceptionCode;
    2: string message;
    3: i64 retryTimeMillis;
}


exception ChatappException {
    1: ChatappErrorCode code;
    2: string reason;
}


exception MembershipException {
    1: MembershipErrorCode code;
    2: string reason;
    3: map<string, string> parameterMap;
}


exception BotException {
    1: BotErrorCode errorCode;
    2: string reason;
    3: map<string, string> parameterMap;
}


exception BotExternalException {
    1: BotExternalErrorCode errorCode;
    2: string reason;
}


exception LiffChannelException {
    1: ChannelErrorCode code;
    2: string reason;
    3: map<string, string> parameterMap;
}


exception AccessTokenRefreshException {
    1: AccessTokenRefreshErrorCode errorCode;
    2: i64 reasonCode;
}


exception AccountEapConnectException {
    1: AccountEapConnectErrorCode code;
    2: string alertMessage;
    11: WebAuthDetails webAuthDetails
}


exception PwlessCredentialException {
    1: PwlessCredentialErrorCode code;
    2: string alertMessage;
}


exception SecondAuthFactorPinCodeException {
    1: SecondAuthFactorPinCodeErrorCode code;
    2: string alertMessage;
}


exception AuthException {
    1: AuthErrorCode code;
    2: string alertMessage;
    11: WebAuthDetails webAuthDetails
}


exception SecondaryPwlessLoginException {
    1: SecondaryPwlessLoginErrorCode code;
    2: string alertMessage;
}


exception SecondaryQrCodeException {
    1: SecondaryQrCodeErrorCode code;
    2: string alertMessage;
}


exception PaymentException {
    1: PaymentErrorCode errorCode;
    2: string debugReason;
    3: string serverDefinedMessage;
    4: map<string, string> errorDetailMap;
}


exception SettingsException {
    1: SettingsErrorCode code;
    2: string reason;
    3: map<string, string> parameterMap;
}


exception TicketException {
    1: i32 code;
    2: string reason;
    3: map<string, string> parameterMap;
}


exception ThingsException {
    1: ThingsErrorCode code;
    2: string reason;
}


exception SuggestTrialException {
    1: SuggestTrialErrorCode code;
    2: string reason;
    3: map<string, string> parameterMap;
}


exception LFLPremiumException {
    1: LFLPremiumErrorCode code;
}


exception WalletException {
    1: WalletErrorCode code;
    2: string reason;
    3: map<string, string> attributes;
}


exception ShopException {
    1: ShopErrorCode code;
    2: string reason;
    3: map<string, string> parameterMap;
}


exception PointException {
    1: PointErrorCode code;
    2: string reason;
    3: map<string, string> extra;
}


exception E2EEKeyBackupException {
    1: E2EEKeyBackupErrorCode code;
    2: string reason;
    3: map<string, string> parameterMap;
}


exception RejectedException {
    1: RejectionReason rejectionReason;
    2: string hint;
}

exception ServerFailureException {
    1: string hint;
}



struct UpdateChatRequest {
    1: i32 reqSeq;
    2: Chat chat;
    3: i32 updatedAttribute;
}

struct UpdateChatResponse {
}

struct AcceptChatInvitationByTicketRequest {
    1: i32 reqSeq;
    2: string chatMid;
    3: string ticketId;
}

struct AcceptChatInvitationByTicketResponse {
}

struct AcceptChatInvitationRequest {
    1: i32 reqSeq;
    2: string chatMid;
}

struct ReissueChatTicketRequest {
    1: i32 reqSeq;
    2: string groupMid;
}

struct AcceptChatInvitationResponse {
}

struct ReissueChatTicketResponse {
    1: string ticketId;
}

struct RejectChatInvitationRequest {
    1: i32 reqSeq;
    2: string chatMid;
}

struct GetAllChatMidsRequest {
    1: optional bool withMemberChats;
    2: optional bool withInvitedChats;
}

struct RejectChatInvitationResponse {
}

struct GetAllChatMidsResponse {
    1: set<string> memberChatMids;
    2: set<string> invitedChatMids;
}

struct CreateChatRequest {
    1: i32 reqSeq;
    2: i32 type;
    3: optional string name;
    4: set<string> targetUserMids;
    5: optional string picturePath;
}

struct CreateChatResponse {
    1: Chat chat;
}

struct BeaconCondition {
    1: string inFriends;
    2: string notInFriends;
    3: bool termsAgreed;
}

struct BeaconBackgroundNotification {
    1: i64 actionInterval;
    2: list<BeaconCondition> actionAndConditions;
    3: i64 actionDelay;
    4: list<BeaconCondition> actionConditions;
}

struct LiffErrorPayload {
    3: LiffErrorConsentRequired consentRequired;
}

struct LiffErrorConsentRequired {
    1: string channelId;
    2: string consentUrl;
}

struct ErrorExtraInfo {
    1: PreconditionFailedExtraInfo preconditionFailedExtraInfo;
    2: UserRestrictionExtraInfo userRestrictionInfo;
}

struct UserRestrictionExtraInfo {
    1: string linkUrl;
}

struct WebAuthDetails {
    1: string baseUrl;
    2: string token;
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
    36: map<string, string> statusMessageContentMetadata;
    37: AvatarProfile avatarProfile;
    38: bool nftProfile;
    39: PictureSource pictureSource;
}

struct AvatarProfile {
    1: string version;
    2: i64 updatedMillis;
    3: string thumbnail;
    4: bool usablePublicly;
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
    25: AppExtensionType appExtensionType;
    27: list<Reaction> reactions;
}

struct Reaction {
    1: string fromUserMid;
    2: i64 atMillis;
    3: ReactionType reactionType;
}

struct ReactionType {
    1: PredefinedReactionType predefinedReactionType;
}

struct ReactRequest {
    1: i32 reqSeq;
    2: i64 messageId;
    3: ReactionType reactionType;
}

struct Location {
    1: string title;
    2: string address;
    3: double latitude;
    4: double longitude;
    5: string phone;
    6: string categoryId;
    7: PlaceSearchProvider provider;
    8: GeolocationAccuracy accuracy;
    9: double altitudeMeters;
}

struct GeolocationAccuracy {
    1: double radiusMeters;
    2: double radiusConfidence;
    3: double altitudeAccuracy;
    4: double velocityAccuracy;
    5: double bearingAccuracy;
    6: GeolocationAccuracyMode accuracyMode;
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
    43: map<string, string> statusMessageContentMetadata;
    44: AvatarProfile avatarProfile;
    45: string friendRingtone;
    46: string friendRingbackTone;
    47: bool nftProfile;
    48: PictureSource pictureSource;
}

struct GetContactsV2Request {
    1: list<string> targetUserMids;
    2: set<ContactCalendarEventType> neededContactCalendarEvents;
    3: bool withUserStatus;
}

struct GetContactsV2Response {
    1: map<string, ContactEntry> contacts;
}

struct ContactEntry {
    1: UserStatus userStatus;
    2: i64 snapshotTimeMillis;
    3: Contact contact;
    4: ContactCalendarEvents calendarEvents;
}

struct ContactCalendarEvents {
    1: map<ContactCalendarEventType, ContactCalendarEvent> events;
}

struct ContactCalendarEvent {
    1: string id;
    2: ContactCalendarEventState state;
    3: i32 year;
    4: i32 month;
    5: i32 day;
}

struct Configurations {
    1: i64 revision;
    2: map<string, string> configMap;
}

struct E2EEPublicKey {
    1: i32 version;
    2: i32 keyId;
    4: binary keyData;
    5: i64 createdTime;
}

struct RSAKey {
    1: string keynm;
    2: string nvalue;
    3: string evalue;
    4: string sessionKey;
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
    19: bool notificationPayment;
    20: bool privacySyncContacts;
    21: bool privacySearchByPhoneNumber;
    22: bool privacySearchByUserid;
    23: bool privacySearchByEmail;
    24: bool privacyAllowSecondaryDeviceLogin;
    25: bool privacyProfileImagePostToMyhome;
    26: bool privacyReceiveMessagesFromNotFriend;
    27: bool privacyAgreeUseLineCoinToPaidCall;
    28: bool privacyAgreeUsePaidCall;
    29: bool privacyAllowFriendRequest;
    30: string contactMyTicket;
    40: IdentityProvider identityProvider;
    41: string identityIdentifier;
    42: map<SnsIdType, string> snsAccounts;
    43: bool phoneRegistration;
    44: EmailConfirmationStatus emailConfirmationStatus;
    45: AccountMigrationPincodeType accountMigrationPincodeType;
    46: bool enforcedInputAccountMigrationPincode;
    47: SecurityCenterSettingsType securityCenterSettingsType;
    48: bool allowUnregistrationSecondaryDevice;
    49: bool pwlessPrimaryCredentialRegistration;
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
    70: i64 agreementShakeFunction;
    71: i64 agreementMobileContactName;
    73: i64 agreementSoundToText;
    74: string privacyPolicyVersion;
    75: i64 agreementAdByWebAccess;
    76: i64 agreementPhoneNumberMatching;
    77: i64 agreementCommunicationInfo;
    78: UserSharePersonalInfoToFriendsType privacySharePersonalInfoToFriends;
    79: i64 agreementThingsWirelessCommunication;
    80: i64 agreementGdpr;
    81: UserStatusMessageHistoryType privacyStatusMessageHistory;
    82: i64 agreementProvideLocation;
    83: i64 agreementBeacon;
    85: UserAllowProfileHistoryType privacyAllowProfileHistory;
    86: i64 agreementContentsSuggest;
    87: i64 agreementContentsSuggestDataCollection;
    88: UserAgeType privacyAgeResult;
    89: bool privacyAgeResultReceived;
    72: bool notificationThumbnail;
    90: i64 agreementOcrImageCollection;
    91: bool privacyAllowFollow;
    92: bool privacyShowFollowList;
    93: bool notificationBadgeTalkOnly;
    94: i64 agreementIcna;
    95: bool notificationReaction;
    96: i64 agreementMid;
    97: bool homeNotificationNewFriend;
    98: bool homeNotificationFavoriteFriendUpdate;
    99: bool homeNotificationGroupMemberUpdate;
    100: bool homeNotificationBirthday;
    101: map<SnsIdType, bool> eapAllowedToConnect;
    102: i64 agreementLineOutUse;
    103: i64 agreementLineOutProvideInfo;
    104: bool notificationShowProfileImage;
    105: i64 agreementPdpa;
    106: string agreementLocationVersion;
    107: bool zhdPageAllowedToShow;
}

struct E2EENegotiationResult {
    1: set<ContentType> allowedTypes;
    2: E2EEPublicKey publicKey;
    3: i32 specVersion;
}

struct ContactRegistration {
    1: Contact contact;
    10: string luid;
    11: ContactType contactType;
    12: string contactKey;
}

struct E2EEGroupSharedKey {
    1: i32 keyVersion;
    2: i32 groupKeyId;
    3: string creator;
    4: i32 creatorKeyId;
    5: string receiver;
    6: i32 receiverKeyId;
    7: binary encryptedSharedKey;
    8: set<ContentType> allowedTypes;
    9: i32 specVersion;
}

struct VerificationSessionData {
    1: string sessionId;
    2: VerificationMethod method;
    3: string callback;
    4: string normalizedPhone;
    5: string countryCode;
    6: string nationalSignificantNumber;
    7: list<VerificationMethod> availableVerificationMethods;
    8: string callerIdMask;
}

struct FollowRequest {
    1: FollowMid followMid;
}

struct FollowMid {
    1: string mid;
    2: string eMid;
}

struct UnfollowRequest {
    1: FollowMid followMid;
}

struct Ticket {
    1: string id;
    10: i64 expirationTime;
    21: i32 maxUseCount;
}

struct GetChatsRequest {
    1: list<string> chatMids;
    2: bool withMembers;
    3: bool withInvitees;
}

struct GetChatsResponse {
    1: list<Chat> chats;
}

struct Chat {
    1: CharType type;
    2: string chatMid;
    3: i64 createdTime;
    4: bool notificationDisabled;
    5: i64 favoriteTimestamp;
    6: string chatName;
    7: string picturePath;
    8: Extra extra;
}

struct Extra {
    1: GroupExtra groupExtra;
    2: PeerExtra peerExtra;
}

struct GroupExtra {
    1: string creator;
    2: bool preventedJoinByTicket;
    3: string invitationTicket;
    4: map<string, i64> memberMids;
    5: map<string, i64> inviteeMids;
    6: bool addFriendDisabled;
    7: bool ticketDisabled;
}

struct PeerExtra {
// ?
}

struct GetFollowersRequest {
    1: FollowMid followMid;
    2: string cursor;
}

struct GetFollowersResponse {
    1: list<FollowProfile> profiles;
    2: string cursor;
    3: i64 followingCount;
    4: i64 followerCount;
}

struct FollowProfile {
    1: FollowMid followMid;
    2: string displayName;
    3: string picturePath;
    4: bool following;
    5: bool allowFollow;
    6: FollowBuddyDetail followBuddyDetail;
}

struct FollowBuddyDetail {
    1: i32 iconType;
}

struct GetFollowingsRequest {
    1: FollowMid followMid;
    2: string cursor;
}

struct GetFollowingsResponse {
    1: list<FollowProfile> profiles;
    2: string cursor;
    3: i64 followingCount;
    4: i64 followerCount;
}

struct Room {
    1: string mid;
    2: i64 createdTime;
    10: list<Contact> contacts;
    31: bool notificationDisabled;
    40: list<string> memberMids;
}

struct ContactModification {
    1: ModificationType type;
    2: string luid;
    11: list<string> phones;
    12: list<string> emails;
    13: list<string> userids;
}

struct GetE2EEKeyBackupCertificatesRequest {
}

struct GetE2EEKeyBackupCertificatesResponse {
    1: list<string> urlHashList;
}

struct DeleteOtherFromChatRequest {
    1: i32 reqSeq;
    2: string chatMid;
    3: set<string> targetUserMids;
}

struct DeleteOtherFromChatResponse {
}

struct InviteIntoChatRequest {
    1: i32 reqSeq;
    2: string chatMid;
    3: set<string> targetUserMids;
}

struct InviteIntoChatResponse {
}

struct CancelChatInvitationRequest {
    1: i32 reqSeq;
    2: string chatMid;
    3: set<string> targetUserMids;
}

struct CancelChatInvitationResponse {
}

struct DeleteSelfFromChatRequest {
    1: i32 reqSeq;
    2: string chatMid;
    3: i64 lastSeenMessageDeliveredTime;
    4: string lastSeenMessageId;
    5: i64 lastMessageDeliveredTime;
    6: string lastMessageId;
}

struct DeleteSelfFromChatResponse {
}

struct FindChatByTicketRequest {
    1: string ticketId;
}

struct FindChatByTicketResponse {
    1: Chat chat;
}

struct RefreshAccessTokenRequest {
    1: string refreshToken;
}

struct RefreshAccessTokenResponse {
    1: string accessToken;
    2: i64 durationUntilRefreshInSec;
    3: RetryPolicy retryPolicy;
    4: i64 tokenIssueTimeEpochSec;
    5: string refreshToken;
}

struct RetryPolicy {
    1: i64 initialDelayInMillis;
    2: i64 maxDelayInMillis;
    3: double multiplier;
    4: double jitterRate;
}

struct TMessageReadRange {
    1: string chatId;
    2: map<string, list<TMessageReadRangeEntry>> ranges;
}

struct TMessageReadRangeEntry {
    1: i64 startMessageId;
    2: i64 endMessageId;
    3: i64 startTime;
    4: i64 endTime;
}

struct BuddyDetail {
    1: string mid;
    2: i64 memberCount;
    3: bool onAir;
    4: bool businessAccount;
    5: bool addable;
    6: set<ContentType> acceptableContentTypes;
    7: bool capableMyhome;
    8: bool freePhoneCallable;
    9: string phoneNumberToDial;
    10: bool needPermissionApproval;
    11: string channelId;
    12: string channelProviderName;
    13: i32 iconType;
    14: BotType botType;
    15: bool showRichMenu;
    16: i64 richMenuRevision;
    17: BuddyOnAirLabel onAirLabel;
    18: bool useTheme;
    19: string themeId;
    20: bool useBar;
    21: i64 barRevision;
    22: bool useBackground;
    23: string backgroundId;
    24: bool statusBarEnabled;
    25: i64 statusBarRevision;
    26: string searchId;
    27: i32 onAirVersion;
    28: bool blockable;
    29: BuddyBotActiveStatus botActiveStatus;
    30: bool membershipEnabled;
}

struct MessageBoxV2MessageId {
    1: i64 deliveredTime;
    2: i64 messageId;
}

struct GetPreviousMessagesV2Request {
    1: string messageBoxId;
    2: MessageBoxV2MessageId endMessageId;
    3: i32 messagesCount;
    4: bool withReadCount;
    5: bool receivedOnly;
}

struct ChannelToken {
    1: string token;
    2: string obsToken;
    3: i64 expiration;
    4: string refreshToken;
    5: string channelAccessToken;
}

struct GroupCall {
    1: bool online;
    2: string chatMid;
    3: string hostMids;
    4: list<string> memberMids;
    5: i64 started;
    6: GroupCallMediaType mediaType;
    7: GroupCallProtocol protocol;
}

struct SyncResponse {
    1: OperationResponse operationResponse;
    2: FullSyncResponse fullSyncResponse;
    3: PartialFullSyncResponse partialFullSyncResponse
}

struct OperationResponse {
    1: list<Operation> operations;
    2: bool hasMoreOps;
    3: TGlobalEvents globalEvents;
    4: TIndividualEvents individualEvents;
}

struct FullSyncResponse {
    1: set<SyncTriggerReason> reasons;
    2: i64 nextRevision
}

struct PartialFullSyncResponse {
    1: map<SyncCategories, i64> targetCategories;
}

struct TGlobalEvents {
    1: map<GlobalEventType, GlobalEvent> events;
    2: i64 lastRevision;
}

struct TIndividualEvents {
    1: set<NotificationStatus> events
    2: i64 lastRevision;
}

struct GlobalEvent {
    1: GlobalEventType type;
    2: i32 minDelayInMinutes;
    3: i32 maxDelayInMinutes;
    4: i64 createTimeMillis;
    5: bool maxDelayHardLimit;
}

struct DetermineMediaMessageFlowResponse {
    1: map<ContentType, MediaMessageFlow> flowMap;
    2: i64 cacheTtlMillis;
}

struct ChatRoomAnnouncementContentMetadata {
    1: string replace;
    2: string sticonOwnership;
    3: string postNotificationMetadata;
}

struct ChatRoomAnnouncementContents {
    1: i32 displayFields;
    2: string text;
    3: string link;
    4: string thumbnail;
    5: ChatRoomAnnouncementContentMetadata contentMetadata;
}

struct ChatRoomAnnouncement {
    1: i64 announcementSeq;
    2: i32 type;
    3: ChatRoomAnnouncementContents contents;
    4: string creatorMid;
    5: i64 createdTime;
    6: i32 deletePermission;
}


service TalkService {
    Profile getProfile(1: TalkSyncReason syncReason) throws(1: TalkException e);
    Message sendMessage(1: i32 seq, 2: Message message) throws(1: TalkException e);
    void unsendMessage(1: i32 seq, 2: string messageId) throws(1: TalkException e);
    void requestResendMessage(1: i32 reqSeq, 2: string senderMid, 3: string messageId) throws(1: TalkException e);
    void respondResendMessage(1: i32 reqSeq, 2: string receiverMid, 3: string originalMessageId, 4: Message resendMessage, 5: ErrorCode errorCode) throws(1: TalkException e);
    void sendChatChecked(1: i32 seq, 2: string chatMid, 3: string lastMessageId, 4: i8 sessionId;) throws(1: TalkException e);
    Contact getContact(2: string id) throws(1: TalkException e);
    list<Contact> getContacts(2: list<string> ids) throws(1: TalkException e);
    GetContactsV2Response getContactsV2(1: GetContactsV2Request request, 2: TalkSyncReason syncReason) throws(1: TalkException e);
    map<string, Contact> findAndAddContactsByMid(1: i32 reqSeq, 2: string mid, 3: ContactType type, 4: string reference) throws(1: TalkException e);
    map<string, Contact> findAndAddContactsByPhone(1: i32 reqSeq, 2: set<string> phones, 3: string reference) throws(1: TalkException e);
    list<string> getAllContactIds() throws(1: TalkException e);
    list<string> getBlockedContactIds() throws(1: TalkException e);
    list<string> getBlockedRecommendationIds() throws(1: TalkException e);
    Configurations getConfigurations(2: i64 revision, 3: string regionOfUsim, 4: string regionOfTelephone, 5: string regionOfLocale, 6: string carrier, 7: TalkSyncReason syncReason) throws(1: TalkException e);
    E2EEPublicKey getE2EEPublicKey(2: string mid, 3: i32 version, 4: i32 keyId) throws(1: TalkException e);
    map<string, Contact> findAndAddContactsByUserid(1: i32 reqSeq, 2: string searchId, 3: string reference) throws(1: TalkException e);
    RSAKey getRSAKeyInfo(2: IdentityProvider provider) throws(1: TalkException e);
    list<string> getRecommendationIds() throws(1: TalkException e);
    Settings getSettings() throws(1: TalkException e);
    Settings getSettingsAttributes2() throws(1: TalkException e);
    E2EENegotiationResult negotiateE2EEPublicKey(2: string mid) throws(1: TalkException e);
    E2EEPublicKey registerE2EEPublicKey(1: i32 reqSeq, 2: E2EEPublicKey publicKey) throws(1: TalkException e);
    map<string, ContactRegistration> syncContacts(1: i32 reqSeq, 2: list<ContactModification> localContacts) throws(1: TalkException e);
    string unregisterUserAndDevice() throws(1: TalkException e);
    E2EEGroupSharedKey registerE2EEGroupKey() throws(1: TalkException e);
    void removeFollower() throws(1: TalkException e);
    void report() throws(1: TalkException e);
    void reportProfile() throws(1: TalkException e);
    void reportPushRecvReports() throws(1: TalkException e);
    void reportSettings() throws(1: TalkException e);
    void requestAccountPasswordReset() throws(1: TalkException e);
    VerificationSessionData changeVerificationMethod() throws(1: TalkException e);
    void resendPinCode() throws(1: TalkException e);
    void clearRingbackTone() throws(1: TalkException e);
    void clearRingtone() throws(1: TalkException e);
    list<Operation> fetchOps(2: i64 localRev, 3: i32 count, 4: i64 globalRev, 5: i64 individualRev) throws(1: TalkException e);
    string decryptFollowEMid(2: string eMid) throws(1: TalkException e);
    Contact findContactByUserTicket(2: string ticketIdWithTag) throws(1: TalkException e);
    void updateContactSetting(1: i32 reqSeq, 2: string mid, 3: ContactSetting flag, 4: string value) throws(1: TalkException e);
    map<string, Contact> findContactsByPhone(2: set<string> phones) throws(1: TalkException e);
    void tryFriendRequest(1: string midOrEMid, 2: FriendRequestMethod method, 3: string friendRequestParams) throws(1: TalkException e);
    void follow(2: FollowRequest followRequest) throws(1: TalkException e);
    void unfollow(2: UnfollowRequest unfollowRequest) throws(1: TalkException e);
    Ticket generateUserTicket(3: i64 expirationTime, 4: i32 maxUseCount) throws(1: TalkException e);
    GetChatsResponse getChats(1: GetChatsRequest request) throws(1: TalkException e);
    void updateNotificationToken(3: NotificationType type, 2: string token) throws(1: TalkException e);
    ContactRegistration getContactRegistration(1: string id, 2: ContactType type) throws(1: TalkException e);
    E2EEGroupSharedKey getE2EEGroupSharedKey(2: i32 keyVersion, 3: string chatMid, 4: i32 groupKeyId) throws(1: TalkException e);
    string verifyQrcode(2: string verifier, 3: string pinCode) throws(1: TalkException e);
    bool wakeUpLongPolling(2: i64 clientRevision) throws(1: TalkException e);
    GetFollowersResponse getFollowers(2: GetFollowersRequest getFollowersRequest) throws(1: TalkException e);
    GetFollowingsResponse getFollowings(2: GetFollowingsRequest getFollowingsRequest) throws(1: TalkException e);
    E2EEGroupSharedKey getLastE2EEGroupSharedKey(2: i32 keyVersion, 3: string chatMid) throws(1: TalkException e);
    map<string, E2EEPublicKey> getLastE2EEPublicKeys(2: string chatMid) throws(1: TalkException e);
    i64 getLastOpRevision() throws(1: TalkException e);
    list<Room> getRoomsV2(2: list<string> roomIds) throws(1: TalkException e);
    bool isUseridAvailable(2: string userid) throws(1: TalkException e);
    string acquireEncryptedAccessToken(2: FeatureType featureType) throws(1: TalkException e);
    RejectChatInvitationResponse rejectChatInvitation(1: RejectChatInvitationRequest request) throws(1: TalkException e);
    GetAllChatMidsResponse getAllChatMids(1: GetAllChatMidsRequest request, 2: i32 syncReason) throws(1: TalkException e);
    DeleteSelfFromChatResponse deleteSelfFromChat(1: DeleteSelfFromChatRequest request) throws(1: TalkException e);
    FindChatByTicketResponse findChatByTicket(1: FindChatByTicketRequest request) throws(1: TalkException e);
    InviteIntoChatResponse inviteIntoChat(1: InviteIntoChatRequest request) throws(1: TalkException e);
    DeleteOtherFromChatResponse deleteOtherFromChat(1: DeleteOtherFromChatRequest request) throws(1: TalkException e);
    CreateChatResponse createChat(1: CreateChatRequest request) throws(1: TalkException e);
    ReissueChatTicketResponse reissueChatTicket(1: ReissueChatTicketRequest request) throws(1: TalkException e);
    CancelChatInvitationResponse cancelChatInvitation(1: CancelChatInvitationRequest request) throws(1: TalkException e);
    UpdateChatResponse updateChat(1: UpdateChatRequest request) throws(1: TalkException e);
    AcceptChatInvitationResponse acceptChatInvitation(1: AcceptChatInvitationRequest request) throws(1: TalkException e);
    AcceptChatInvitationByTicketResponse acceptChatInvitationByTicket(1: AcceptChatInvitationByTicketRequest request) throws(1: TalkException e);
    list<TMessageReadRange> getMessageReadRange(2: list<string> chatIds, 3: TalkSyncReason syncReason;) throws(1: TalkException e);
    void react(1: ReactRequest reactRequest) throws(1: TalkException e);
    list<Message> getPreviousMessagesV2WithRequest(2: GetPreviousMessagesV2Request request, 3: TalkSyncReason syncReason) throws(1: TalkException e);
    list<Message> getPreviousMessagesV2() throws(1: TalkException e);
    list<Message> getRecentMessagesV2(2: string messageBoxId, 3: i32 messagesCount) throws(1: TalkException e);
    void cancelReaction(// 1: CancelReactionRequest cancelReactionRequest;
) throws(1: TalkException e);
    DetermineMediaMessageFlowResponse determineMediaMessageFlow(# 1: GetMediaMessageFlowRequest getMediaMessageFlowRequest;
) throws(1: TalkException e);
    map<string, list<ChatRoomAnnouncement>> getChatRoomAnnouncementsBulk() throws(1: TalkException e);
    list<ChatRoomAnnouncement> getChatRoomAnnouncements() throws(1: TalkException e);
    void removeChatRoomAnnouncement() throws(1: TalkException e);
    ChatRoomAnnouncement createChatRoomAnnouncement() throws(1: TalkException e);
}


service E2EEKeyBackupService {
    GetE2EEKeyBackupCertificatesResponse getE2EEKeyBackupCertificates(2: GetE2EEKeyBackupCertificatesRequest request) throws(1: E2EEKeyBackupException e);
}


service AccessTokenRefreshService {
    RefreshAccessTokenResponse refresh(1: RefreshAccessTokenRequest request,) throws(1: AccessTokenRefreshException e);
}


service BuddyService {
    BuddyDetail getBuddyDetail(4: string buddyMid) throws(1: TalkException e);
}


service CallService {
    GroupCall getGroupCall(2: string chatMid) throws(1: TalkException e);
}


service SyncService {
    SyncResponse sync() throws(1: TalkException e);
}




struct DisasterInfo {
    1: string   disasterId;            
    2: string   title;                 
    3: string   region;                
    4: string   disasterDescription;   
    5: string   seeMoreUrl;            
    7: i32      status;                
}

struct GetDisasterCasesRequest {
}

struct GetDisasterCasesResponse {
    1: list<DisasterInfo>   disasters;         
    2: list<string>         messageTemplate;   
    3: i64                  ttlInMillis;       
}





service HomeSafetyCheckService {
    void deleteSafetyStatus(# 1: DeleteSafetyStatusRequest req,
) throws(1: HomeException e);
    GetDisasterCasesResponse getDisasterCases(1: GetDisasterCasesRequest req,) throws(1: HomeException e);
    void updateSafetyStatus(# 1: UpdateSafetyStatusRequest req,
) throws(1: HomeException e);
}


enum SquareMessageState {
    SENT      = 1;
    DELETED   = 2;
    FORBIDDEN = 3;
    UNSENT    = 4;
}

enum SquareEventType {
    RECEIVE_MESSAGE                              = 0;
    SEND_MESSAGE                                 = 1;
    MUTATE_MESSAGE                               = 41;
    NOTIFIED_JOIN_SQUARE_CHAT                    = 2;
    NOTIFIED_INVITE_INTO_SQUARE_CHAT             = 3;
    NOTIFIED_LEAVE_SQUARE_CHAT                   = 4;
    NOTIFIED_DESTROY_MESSAGE                     = 5;
    NOTIFIED_MARK_AS_READ                        = 6;
    NOTIFIED_UPDATE_SQUARE_MEMBER_PROFILE        = 7;
    NOTIFIED_KICKOUT_FROM_SQUARE                 = 19;
    NOTIFIED_SHUTDOWN_SQUARE                     = 18;
    NOTIFIED_DELETE_SQUARE_CHAT                  = 20;
    NOTIFIED_UPDATE_SQUARE_CHAT_PROFILE_NAME     = 30;
    NOTIFIED_UPDATE_SQUARE_CHAT_PROFILE_IMAGE    = 31;
    NOTIFIED_UPDATE_SQUARE_CHAT_MAX_MEMBER_COUNT = 38;
    NOTIFIED_UPDATE_SQUARE_CHAT_ANNOUNCEMENT     = 37;
    NOTIFIED_ADD_BOT                             = 33;
    NOTIFIED_REMOVE_BOT                          = 34;
    NOTIFIED_UPDATE_READONLY_CHAT                = 43;
    NOTIFIED_UPDATE_MESSAGE_STATUS               = 46;
    NOTIFIED_CHAT_POPUP                          = 48;
    NOTIFIED_SYSTEM_MESSAGE                      = 49;
    NOTIFIED_UPDATE_SQUARE                       = 8;
    NOTIFIED_UPDATE_SQUARE_STATUS                = 9;
    NOTIFIED_UPDATE_SQUARE_AUTHORITY             = 10;
    NOTIFIED_UPDATE_SQUARE_MEMBER                = 11;
    NOTIFIED_UPDATE_SQUARE_CHAT                  = 12;
    NOTIFIED_UPDATE_SQUARE_CHAT_STATUS           = 13;
    NOTIFIED_UPDATE_SQUARE_CHAT_MEMBER           = 14;
    NOTIFIED_CREATE_SQUARE_MEMBER                = 15;
    NOTIFIED_CREATE_SQUARE_CHAT_MEMBER           = 16;
    NOTIFIED_UPDATE_SQUARE_MEMBER_RELATION       = 17;
    NOTIFIED_UPDATE_SQUARE_FEATURE_SET           = 32;
    NOTIFIED_UPDATE_SQUARE_CHAT_FEATURE_SET      = 50;
    NOTIFIED_UPDATE_SQUARE_NOTE_STATUS           = 36;
    NOTIFICATION_JOIN_REQUEST                    = 21;
    NOTIFICATION_JOINED                          = 22;
    NOTIFICATION_PROMOTED_COADMIN                = 23;
    NOTIFICATION_PROMOTED_ADMIN                  = 24;
    NOTIFICATION_DEMOTED_MEMBER                  = 25;
    NOTIFICATION_KICKED_OUT                      = 26;
    NOTIFICATION_SQUARE_DELETE                   = 27;
    NOTIFICATION_SQUARE_CHAT_DELETE              = 28;
    NOTIFICATION_MESSAGE                         = 29;
    NOTIFICATION_POST_ANNOUNCEMENT               = 39;
    NOTIFICATION_POST                            = 40;
    NOTIFICATION_NEW_CHAT_MEMBER                 = 42;
    NOTIFICATION_MESSAGE_REACTION                = 47;
}

enum SquareEventStatus {
    NORMAL         = 1;
    ALERT_DISABLED = 2;
}

struct SquareMessage {
    1: Message message;
    3: MIDType fromType;
    4: i64 squareMessageRevision;
    5: SquareMessageState state;
}

enum SquareMembershipState {
    JOIN_REQUESTED = 1;
    JOINED         = 2;
    REJECTED       = 3;
    LEFT           = 4;
    KICK_OUT       = 5;
    BANNED         = 6;
    DELETED        = 7;
}

enum SquareMemberRole {
    ADMIN    = 1;
    CO_ADMIN = 2;
    MEMBER   = 10;
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

struct SquareMessageReaction {
    1: MessageReactionType type;
    2: SquareMember reactor;
    3: i64 createdAt;
    4: i64 updatedAt;
}

struct SquareMessageReactionStatus {
    1: i32 totalCount;
    2: map<MessageReactionType, i32> countByReactionType;
    3: SquareMessageReaction myReaction;
}

struct SquareEventReceiveMessage {
    1: string squareChatMid;
    2: SquareMessage squareMessage;
    3: string senderDisplayName;
    4: SquareMessageReactionStatus messageReactionStatus;
    5: i64 senderRevision;
    6: string squareMid;
}

struct SquareEventSendMessage {
    1: string squareChatMid;
    2: SquareMessage squareMessage;
    3: i32 reqSeq;
    4: string senderDisplayName;
    5: SquareMessageReactionStatus messageReactionStatus;
}

struct SquareEventMutateMessage {
    1: string squareChatMid;
    2: SquareMessage squareMessage;
    3: i32 reqSeq;
    4: string senderDisplayName;
}

struct SquareEventNotifiedJoinSquareChat {
    1: string squareChatMid;
    2: SquareMember joinedMember;
}

enum SquareMemberRelationState {
    NONE    = 1;
    BLOCKED = 2;
}

struct SquareMemberRelation {
    1: SquareMemberRelationState state;
    2: i64 revision;
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
    4: SquareMember kicker;
}

enum SquareType {
    CLOSED = 0;
    OPEN   = 1;
}

enum SquareState {
    ALIVE     = 0;
    DELETED   = 1;
    SUSPENDED = 2;
}

enum SquareEmblem {
    SUPER    = 1;
    OFFICIAL = 2;
}

enum SquareJoinMethodType {
    NONE     = 0;
    APPROVAL = 1;
    CODE     = 2;
}

struct ApprovalValue {
    1: string message;
}

struct CodeValue {
    1: string code;
}

struct SquareJoinMethodValue {
    1: ApprovalValue approvalValue;
    2: CodeValue codeValue;
}

struct SquareJoinMethod {
    1: SquareJoinMethodType type;
    2: SquareJoinMethodValue value;
}

enum BooleanState {
    NONE = 0;
    OFF  = 1;
    ON   = 2;
}

struct Square {
    1: string mid;
    2: string name;
    3: string welcomeMessage;
    4: string profileImageObsHash;
    5: string desc;
    6: bool searchable;
    7: SquareType type;
    8: i32 categoryId;
    9: string invitationURL;
    10: i64 revision;
    11: bool ableToUseInvitationTicket;
    12: SquareState state;
    13: list<SquareEmblem> emblems;
    14: SquareJoinMethod joinMethod;
    15: BooleanState adultOnly;
    16: list<string> svcTags;
    17: i64 createdAt;
}

struct SquareEventNotifiedShutdownSquare {
    1: string squareChatMid;
    2: Square square;
}

enum SquareChatType {
    OPEN           = 1;
    SECRET         = 2;
    ONE_ON_ONE     = 3;
    SQUARE_DEFAULT = 4;
}

enum SquareChatState {
    ALIVE     = 0;
    DELETED   = 1;
    SUSPENDED = 2;
}

struct MessageVisibility {
    1: bool showJoinMessage;
    2: bool showLeaveMessage;
    3: bool showKickoutMessage;
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
    9: string invitationUrl;
    10: MessageVisibility messageVisibility;
    11: BooleanState ableToSearchMessage;
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

struct SquareEventNotifiedUpdateSquareChatMaxMemberCount {
    1: string squareChatMid;
    2: i32 maxMemberCount;
    3: SquareMember editor;
}

struct SquareEventNotifiedAddBot {
    1: string squareChatMid;
    2: SquareMember squareMember;
    3: string botMid;
    4: string botDisplayName;
}

struct SquareEventNotifiedRemoveBot {
    1: string squareChatMid;
    2: SquareMember squareMember;
    3: string botMid;
    4: string botDisplayName;
}

struct SquareEventNotifiedUpdateReadonlyChat {
    1: string squareChatMid;
    2: bool readonly;
}

enum MessageStatusType {
}

struct MessageStatusContents {
    1: SquareMessageReactionStatus messageReactionStatus;
}

struct SquareMessageStatus {
    1: string squareChatMid;
    2: string globalMessageId;
    3: MessageStatusType type;
    4: MessageStatusContents contents;
    5: i64 publishedAt;
}

struct SquareEventNotifiedUpdateMessageStatus {
    1: string squareChatMid;
    2: string messageId;
    3: SquareMessageStatus messageStatus;
}

struct UrlButton {
    1: string text;
    2: string url;
}

struct TextButton {
    1: string text;
}

struct OkButton {
    1: string text;
}

struct ButtonContent {
    1: UrlButton urlButton;
    2: TextButton textButton;
    3: OkButton okButton;
}

struct SquareEventChatPopup {
    1: string squareChatMid;
    2: i64 popupId;
    3: string flexJson;
    4: ButtonContent button;
}

struct SquareEventNotifiedSystemMessage {
    1: string squareChatMid;
    2: string text;
}

struct SquareStatus {
    1: i32 memberCount;
    2: i32 joinRequestCount;
    3: i64 lastJoinRequestAt;
    4: i32 openChatCount;
}

struct SquareEventNotifiedUpdateSquareChat {
    1: string squareMid;
    2: string squareChatMid;
    3: SquareChat squareChat;
}

enum NotifiedMessageType {
    MENTION = 1;
    REPLY   = 2;
}

struct SquareChatStatusWithoutMessage {
    1: i32 memberCount;
    2: i32 unreadMessageCount;
    3: string markedAsReadMessageId;
    4: string mentionedMessageId;
    5: NotifiedMessageType notifiedMessageType;
}

struct SquareEventNotifiedUpdateSquareChatStatus {
    1: string squareChatMid;
    2: SquareChatStatusWithoutMessage statusWithoutMessage;
}

enum SquareChatMembershipState {
    JOINED = 1;
    LEFT   = 2;
}

struct SquareChatMember {
    1: string squareMemberMid;
    2: string squareChatMid;
    3: i64 revision;
    4: SquareChatMembershipState membershipState;
    5: bool notificationForMessage;
    6: bool notificationForNewMember;
}

struct SquareEventNotifiedUpdateSquareChatMember {
    1: string squareChatMid;
    2: SquareChatMember squareChatMember;
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
    12: SquareMemberRole createSquareChatAnnouncement;
    13: SquareMemberRole updateMaxChatMemberCount;
    14: SquareMemberRole useReadonlyDefaultChat;
}

struct SquareEventNotifiedUpdateSquareAuthority {
    1: string squareMid;
    2: SquareAuthority squareAuthority;
}

enum SquareFeatureControlState {
    DISABLED = 1;
    ENABLED  = 2;
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
    13: SquareFeature creatingSquareChat;
    14: SquareFeature readonlyDefaultChat;
    15: SquareFeature showingAdvertisement;
    16: SquareFeature delegateJoinToPlug;
    17: SquareFeature delegateKickOutToPlug;
    18: SquareFeature disableUpdateJoinMethod;
    19: SquareFeature disableTransferAdmin;
    20: SquareFeature creatingLiveTalk;
    21: SquareFeature disableUpdateSearchable;
}

struct NoteStatus {
    1: i32 noteCount;
    2: i64 latestCreatedAt;
}

struct SquareEventNotifiedCreateSquareMember {
    1: Square square;
    2: SquareAuthority squareAuthority;
    3: SquareStatus squareStatus;
    4: SquareMember squareMember;
    5: SquareFeatureSet squareFeatureSet;
    6: NoteStatus noteStatus;
}

struct SquareChatStatus {
    3: SquareMessage lastMessage;
    4: string senderDisplayName;
    5: SquareChatStatusWithoutMessage otherStatus;
}

enum SquareChatFeatureControlState {
    DISABLED = 1;
    ENABLED  = 2;
}

struct SquareChatFeature {
    1: SquareChatFeatureControlState controlState;
    2: BooleanState booleanValue;
}

struct SquareChatFeatureSet {
    1: string squareChatMid;
    2: i64 revision;
    11: SquareChatFeature disableUpdateMaxChatMemberCount;
    12: SquareChatFeature disableMarkAsReadEvent;
}

struct SquareEventNotifiedCreateSquareChatMember {
    1: SquareChat chat;
    2: SquareChatStatus chatStatus;
    3: SquareChatMember chatMember;
    4: i64 joinedAt;
    5: SquareMember peerSquareMember;
    6: SquareChatFeatureSet squareChatFeatureSet;
}

struct SquareEventNotifiedUpdateSquareMemberRelation {
    1: string squareMid;
    2: string myMemberMid;
    3: string targetSquareMemberMid;
    4: SquareMemberRelation squareMemberRelation;
}

struct SquareEventNotifiedUpdateSquareFeatureSet {
    1: SquareFeatureSet squareFeatureSet;
}

struct SquareEventNotifiedUpdateSquareChatFeatureSet {
    1: SquareChatFeatureSet squareChatFeatureSet;
}

struct SquareEventNotifiedUpdateSquareNoteStatus {
    1: string squareMid;
    2: NoteStatus noteStatus;
}

struct SquareEventNotifiedUpdateSquareChatAnnouncement {
    1: string squareChatMid;
    2: i64 announcementSeq;
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
    2: SquareMessage squareMessage;
    3: string senderDisplayName;
    4: i32 unreadCount;
    5: bool requiredToFetchChatEvents;
    6: string mentionedMessageId;
    7: NotifiedMessageType notifiedMessageType;
    8: i32 reqSeq;
}

struct SquareEventNotificationPostAnnouncement {
    1: string squareMid;
    2: string squareName;
    3: string squareProfileImageObsHash;
    4: string actionUri;
}

enum NotificationPostType {
    POST_MENTION         = 2;
    POST_LIKE            = 3;
    POST_COMMENT         = 4;
    POST_COMMENT_MENTION = 5;
    POST_COMMENT_LIKE    = 6;
    POST_RELAY_JOIN      = 7;
}

struct SquareEventNotificationPost {
    1: string squareMid;
    2: NotificationPostType notificationPostType;
    3: string thumbnailObsHash;
    4: string text;
    5: string actionUri;
}

struct SquareEventNotificationNewChatMember {
    1: string squareChatMid;
    2: string squareChatName;
}

struct SquareEventNotificationMessageReaction {
    1: string squareChatMid;
    2: string messageId;
    3: string squareChatName;
    4: string reactorName;
    5: string thumbnailObsHash;
    6: string messageText;
    7: MessageReactionType type;
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
    9: SquareEventNotifiedUpdateSquare notifiedUpdateSquare;
    10: SquareEventNotifiedUpdateSquareMember notifiedUpdateSquareMember;
    11: SquareEventNotifiedUpdateSquareChat notifiedUpdateSquareChat;
    12: SquareEventNotifiedUpdateSquareChatMember notifiedUpdateSquareChatMember;
    13: SquareEventNotifiedUpdateSquareAuthority notifiedUpdateSquareAuthority;
    14: SquareEventNotifiedUpdateSquareStatus notifiedUpdateSquareStatus;
    15: SquareEventNotifiedUpdateSquareChatStatus notifiedUpdateSquareChatStatus;
    16: SquareEventNotifiedCreateSquareMember notifiedCreateSquareMember;
    17: SquareEventNotifiedCreateSquareChatMember notifiedCreateSquareChatMember;
    18: SquareEventNotifiedUpdateSquareMemberRelation notifiedUpdateSquareMemberRelation;
    19: SquareEventNotifiedShutdownSquare notifiedShutdownSquare;
    20: SquareEventNotifiedKickoutFromSquare notifiedKickoutFromSquare;
    21: SquareEventNotifiedDeleteSquareChat notifiedDeleteSquareChat;
    22: SquareEventNotificationJoinRequest notificationJoinRequest;
    23: SquareEventNotificationMemberUpdate notificationJoined;
    24: SquareEventNotificationMemberUpdate notificationPromoteCoadmin;
    25: SquareEventNotificationMemberUpdate notificationPromoteAdmin;
    26: SquareEventNotificationMemberUpdate notificationDemoteMember;
    27: SquareEventNotificationMemberUpdate notificationKickedOut;
    28: SquareEventNotificationSquareDelete notificationSquareDelete;
    29: SquareEventNotificationSquareChatDelete notificationSquareChatDelete;
    30: SquareEventNotificationMessage notificationMessage;
    31: SquareEventNotifiedUpdateSquareChatProfileName notifiedUpdateSquareChatProfileName;
    32: SquareEventNotifiedUpdateSquareChatProfileImage notifiedUpdateSquareChatProfileImage;
    33: SquareEventNotifiedUpdateSquareFeatureSet notifiedUpdateSquareFeatureSet;
    34: SquareEventNotifiedAddBot notifiedAddBot;
    35: SquareEventNotifiedRemoveBot notifiedRemoveBot;
    36: SquareEventNotifiedUpdateSquareNoteStatus notifiedUpdateSquareNoteStatus;
    37: SquareEventNotifiedUpdateSquareChatAnnouncement notifiedUpdateSquareChatAnnouncement;
    38: SquareEventNotifiedUpdateSquareChatMaxMemberCount notifiedUpdateSquareChatMaxMemberCount;
    39: SquareEventNotificationPostAnnouncement notificationPostAnnouncement;
    40: SquareEventNotificationPost notificationPost;
    41: SquareEventMutateMessage mutateMessage;
    42: SquareEventNotificationNewChatMember notificationNewChatMember;
    43: SquareEventNotifiedUpdateReadonlyChat notifiedUpdateReadonlyChat;
    44: SquareEventNotifiedUpdateMessageStatus notifiedUpdateMessageStatus;
    45: SquareEventNotificationMessageReaction notificationMessageReaction;
    46: SquareEventChatPopup chatPopup;
    47: SquareEventNotifiedSystemMessage notifiedSystemMessage;
    48: SquareEventNotifiedUpdateSquareChatFeatureSet notifiedUpdateSquareChatFeatureSet;
}

struct SquareEvent {
    2: i64 createdTime;
    3: SquareEventType type;
    4: SquareEventPayload payload;
    5: string syncToken;
    6: SquareEventStatus eventStatus;
}

struct SendMessageResponse {
    1: SquareMessage createdSquareMessage;
}

struct UnsendMessageResponse {
    1: SquareMessage unsentMessage;
}

struct FetchMyEventsResponse {
    1: SubscriptionState subscription;
    2: list<SquareEvent> events;
    3: string syncToken;
    4: string continuationToken;
}

struct GetSquareEmidResponse {
    1: string squareEmid;
}

struct GetSquareMembersBySquareResponse {
    1: list<SquareMember> members;
}

struct ManualRepairResponse {
    1: list<SquareEvent> events;
    2: string syncToken;
    3: string continuationToken;
}

struct InviteIntoSquareChatResponse {
    1: list<string> inviteeMids;
}

struct InviteToSquareResponse {
}

struct GetJoinedSquaresResponse {
    1: list<Square> squares;
    2: map<string, SquareMember> members;
    3: map<string, SquareAuthority> authorities;
    4: map<string, SquareStatus> statuses;
    5: string continuationToken;
    6: map<string, NoteStatus> noteStatuses;
}

struct MarkAsReadResponse {
}

struct ReactToMessageResponse {
    1: SquareMessageReaction reaction;
    2: SquareMessageReactionStatus status;
}

struct FindSquareByInvitationTicketResponse {
    1: Square square;
    2: SquareMember myMembership;
    3: SquareAuthority squareAuthority;
    4: SquareStatus squareStatus;
    5: SquareFeatureSet squareFeatureSet;
    6: NoteStatus noteStatus;
    7: SquareChat chat;
    8: SquareChatStatus chatStatus;
}

struct SubscriptionState {
    1: i64 subscriptionId;
    2: i64 ttlMillis;
}

struct FetchSquareChatEventsResponse {
    1: SubscriptionState subscription;
    2: list<SquareEvent> events;
    3: string syncToken;
    4: string continuationToken;
}

struct GetSquareResponse {
    1: Square square;
    2: SquareMember myMembership;
    3: SquareAuthority squareAuthority;
    4: SquareStatus squareStatus;
    5: SquareFeatureSet squareFeatureSet;
    6: NoteStatus noteStatus;
}

struct GetJoinableSquareChatsResponse {
    1: list<SquareChat> squareChats;
    2: string continuationToken;
    3: i32 totalSquareChatCount;
    4: map<string, SquareChatStatus> squareChatStatuses;
}

struct CreateSquareResponse {
    1: Square square;
    2: SquareMember creator;
    3: SquareAuthority authority;
    4: SquareStatus status;
    5: SquareFeatureSet featureSet;
    6: NoteStatus noteStatus;
    7: SquareChat squareChat;
    8: SquareChatStatus squareChatStatus;
    9: SquareChatMember squareChatMember;
    10: SquareChatFeatureSet squareChatFeatureSet;
}

struct TextMessageAnnouncementContents {
    1: string messageId;
    2: string text;
    3: string senderSquareMemberMid;
    4: i64 createdAt;
    5: string senderMid;
}

struct SquareChatAnnouncementContents {
    1: TextMessageAnnouncementContents textMessageAnnouncementContents;
}

struct SquareChatAnnouncement {
    1: i64 announcementSeq;
    2: SquareChatAnnouncementType type;
    3: SquareChatAnnouncementContents contents;
    4: i64 createdAt;
    5: string creator;
}

struct GetSquareChatAnnouncementsResponse {
    1: list<SquareChatAnnouncement> announcements;
}

struct GetSquareFeatureSetResponse {
    1: SquareFeatureSet squareFeatureSet;
}

struct GetSquareChatFeatureSetResponse {
    1: SquareChatFeatureSet squareChatFeatureSet;
}

struct SyncSquareMembersResponse {
    1: list<SquareMember> updatedSquareMembers;
}

enum SquareChatThreadState {
    ACTIVE   = 1,
    INACTIVE = 2;
}

struct SquareChatThread {
    1: string squareChatThreadMid;
    2: string squareChatMid;
    3: string squareMid;
    4: string messageId;
    5: SquareChatThreadState state;
}

struct GetJoinedSquareChatThreadsResponse {
    1: list<SquareChatThread> squareChatThreads;
    2: string continuationToken;
}

struct CreateSquareChatThreadResponse {
    1: SquareChatThread squareChatThread;
}

enum SquareChatThreadeMembershipState {
    ACTIVATED   = 1,
    DEACTIVATED = 2;
}

struct SquareChatThreadMember {
    1: string squareMemberMid;
    2: string squareChatThreadMid;
    3: i64 revision;
    4: SquareChatThreadeMembershipState membershipState;
}

struct GetSquareChatThreadResponse {
    1: SquareChatThread squareChatThread;
    2: SquareChatThreadMember mySquareChatThreadMember;
}

struct JoinSquareChatThreadResponse {
    1: SquareChatThread squareChatThread;
}


service SquareService {
    SendMessageResponse sendMessage() throws(1: SquareException e);
    UnsendMessageResponse unsendSquareMessage() throws(1: SquareException e);
    FetchMyEventsResponse fetchMyEvents() throws(1: SquareException e);
    GetSquareEmidResponse getSquareEmid() throws(1: SquareException e);
    GetSquareMembersBySquareResponse getSquareMembersBySquare() throws(1: SquareException e);
    ManualRepairResponse manualRepair() throws(1: SquareException e);
    InviteIntoSquareChatResponse inviteIntoSquareChat() throws(1: SquareException e);
    InviteToSquareResponse inviteToSquare() throws(1: SquareException e);
    GetJoinedSquaresResponse getJoinedSquares() throws(1: SquareException e);
    MarkAsReadResponse markAsRead() throws(1: SquareException e);
    ReactToMessageResponse reactToMessage() throws(1: SquareException e);
    FindSquareByInvitationTicketResponse findSquareByInvitationTicket() throws(1: SquareException e);
    FetchSquareChatEventsResponse fetchSquareChatEvents() throws(1: SquareException e);
    GetSquareResponse getSquare() throws(1: SquareException e);
    GetJoinableSquareChatsResponse getJoinableSquareChats() throws(1: SquareException e);
    CreateSquareResponse createSquare() throws(1: SquareException e);
    GetSquareChatAnnouncementsResponse getSquareChatAnnouncements() throws(1: SquareException e);
    GetSquareFeatureSetResponse getSquareFeatureSet() throws(1: SquareException e);
    GetSquareChatFeatureSetResponse getSquareChatFeatureSet() throws(1: SquareException e);
    GetJoinedSquareChatThreadsResponse getJoinedSquareChatThreads() throws(1: SquareException e);
    CreateSquareChatThreadResponse createSquareChatThread() throws(1: SquareException e);
    GetSquareChatThreadResponse getSquareChatThread() throws(1: SquareException e);
    JoinSquareChatThreadResponse joinSquareChatThread() throws(1: SquareException e);
    SyncSquareMembersResponse syncSquareMembers() throws(1: SquareException e);
}


struct AcceptSpeakersResponse {
}

struct AcceptToChangeRoleResponse {
}

struct AcceptToListenResponse {
}

struct AcceptToSpeakResponse {
}

struct CancelToSpeakResponse {
}

struct EndLiveTalkResponse {
}

enum LiveTalkEventType {
    NOTIFIED_UPDATE_LIVE_TALK_TITLE                  = 1;
    NOTIFIED_UPDATE_LIVE_TALK_SPEAKER_SETTING        = 2;
    NOTIFIED_UPDATE_LIVE_TALK_ANNOUNCEMENT           = 3;
    NOTIFIED_UPDATE_SQUARE_MEMBER_ROLE               = 4;
    NOTIFIED_UPDATE_LIVE_TALK_ALLOW_REQUEST_TO_SPEAK = 5;
}

struct LiveTalkEventNotifiedUpdateLiveTalkTitle {
    1: string title;
}

enum LiveTalkSpeakerSetting {
    LIMITED_SPEAKERS = 1;
    ALL_AS_SPEAKERS  = 2;
}

struct LiveTalkEventNotifiedUpdateLiveTalkSpeakerSetting {
    1: LiveTalkSpeakerSetting speakerSetting;
}

struct LiveTalkEventNotifiedUpdateLiveTalkAnnouncement {
    1: string announcement;
}

struct LiveTalkEventNotifiedUpdateSquareMemberRole {
    1: string squareMemberMid;
    2: SquareMemberRole role;
}

struct LiveTalkEventNotifiedUpdateLiveTalkAllowRequestToSpeak {
    1: bool allowRequestToSpeak;
}

struct LiveTalkEventPayload {
    1: LiveTalkEventNotifiedUpdateLiveTalkTitle notifiedUpdateLiveTalkTitle;
    2: LiveTalkEventNotifiedUpdateLiveTalkSpeakerSetting notifiedUpdateLiveTalkSpeakerSetting;
    3: LiveTalkEventNotifiedUpdateLiveTalkAnnouncement notifiedUpdateLiveTalkAnnouncement;
    4: LiveTalkEventNotifiedUpdateSquareMemberRole notifiedUpdateSquareMemberRole;
    5: LiveTalkEventNotifiedUpdateLiveTalkAllowRequestToSpeak notifiedUpdateLiveTalkAllowRequestToSpeak;
}

struct LiveTalkEvent {
    1: LiveTalkEventType type;
    2: LiveTalkEventPayload payload;
    3: string syncToken;
}

struct FetchLiveTalkEventsResponse {
    1: list<LiveTalkEvent> events;
    2: string syncToken;
    3: bool hasMore;
}

enum LiveTalkType {
    PUBLIC  = 1;
    PRIVATE = 2;
}

struct LiveTalk {
    1: string squareChatMid;
    2: string sessionId;
    3: string title;
    4: LiveTalkType type;
    5: LiveTalkSpeakerSetting speakerSetting;
    6: bool allowRequestToSpeak;
    7: string announcement;
    8: i32 participantCount;
    9: i64 revision;
    10: i64 startedAt;
}

struct FindLiveTalkByInvitationTicketResponse {
    1: string chatInvitationTicket;
    2: LiveTalk liveTalk;
    3: SquareChat chat;
    4: SquareMember squareMember;
    5: SquareChatMembershipState chatMembershipState;
}

struct ForceEndLiveTalkResponse {
}

struct LiveTalkSpeaker {
    1: string displayName;
    2: string profileImageObsHash;
    3: SquareMemberRole role;
}

struct GetLiveTalkInfoForNonMemberResponse {
    1: string chatName;
    2: LiveTalk liveTalk;
    3: list<LiveTalkSpeaker> speakers
    4: string chatInvitationUrl;
}

struct GetLiveTalkInvitationUrlResponse {
    1: string invitationUrl;
}

struct GetLiveTalkSpeakersForNonMemberResponse {
    1: list<LiveTalkSpeaker> speakers;
}

struct GetSquareInfoByChatMidResponse {
    1: string defaultChatMid;
    2: string squareName;
    3: string squareDesc;
}

struct InviteToChangeRoleResponse {
}

struct InviteToListenResponse {
}

struct InviteToLiveTalkResponse {
}

struct InviteToSpeakResponse {
    1: string inviteRequestId;
}

struct JoinLiveTalkResponse {
    1: string hostMemberMid;
    2: string memberSessionId;
    3: string token;
    4: string proto;
    5: string voipAddress;
    6: string voipAddress6;
    7: i32 voipUdpPort;
    8: i32 voipTcpPort;
    9: string fromZone;
    10: string commParam;
    11: string orionAddress;
    12: string polarisAddress;
    13: string polarisZone;
    14: i32 polarisUdpPort;
}

struct KickOutLiveTalkParticipantsResponse {
}

struct RejectSpeakersResponse {
}

struct RejectToSpeakResponse {
}

struct ReportLiveTalkResponse {
}

struct ReportLiveTalkSpeakerResponse {
}

struct RequestToListenResponse {
}

struct RequestToSpeakResponse {
}

struct StartLiveTalkResponse {
    1: LiveTalk liveTalk;
}

struct UpdateLiveTalkAttrsResponse {
}

struct AcquireLiveTalkResponse {
    1: LiveTalk liveTalk;
}


service SquareLiveTalkService {
    AcceptSpeakersResponse acceptSpeakers() throws(1: SquareException e);
    AcceptToChangeRoleResponse acceptToChangeRole() throws(1: SquareException e);
    AcceptToListenResponse acceptToListen() throws(1: SquareException e);
    AcceptToSpeakResponse acceptToSpeak() throws(1: SquareException e);
    CancelToSpeakResponse cancelToSpeak() throws(1: SquareException e);
    EndLiveTalkResponse endLiveTalk() throws(1: SquareException e);
    FetchLiveTalkEventsResponse fetchLiveTalkEvents() throws(1: SquareException e);
    FindLiveTalkByInvitationTicketResponse findLiveTalkByInvitationTicket() throws(1: SquareException e);
    ForceEndLiveTalkResponse forceEndLiveTalk() throws(1: SquareException e);
    GetLiveTalkInfoForNonMemberResponse getLiveTalkInfoForNonMember() throws(1: SquareException e);
    GetLiveTalkInvitationUrlResponse getLiveTalkInvitationUrl() throws(1: SquareException e);
    GetLiveTalkSpeakersForNonMemberResponse getLiveTalkSpeakersForNonMember() throws(1: SquareException e);
    GetSquareInfoByChatMidResponse getSquareInfoByChatMid() throws(1: SquareException e);
    InviteToChangeRoleResponse inviteToChangeRole() throws(1: SquareException e);
    InviteToListenResponse inviteToListen() throws(1: SquareException e);
    InviteToLiveTalkResponse inviteToLiveTalk() throws(1: SquareException e);
    InviteToSpeakResponse inviteToSpeak() throws(1: SquareException e);
    JoinLiveTalkResponse joinLiveTalk() throws(1: SquareException e);
    KickOutLiveTalkParticipantsResponse kickOutLiveTalkParticipants() throws(1: SquareException e);
    RejectSpeakersResponse rejectSpeakers() throws(1: SquareException e);
    RejectSpeakersResponse rejectToSpeak() throws(1: SquareException e);
    ReportLiveTalkResponse reportLiveTalk() throws(1: SquareException e);
    ReportLiveTalkSpeakerResponse reportLiveTalkSpeaker() throws(1: SquareException e);
    RequestToListenResponse requestToListen() throws(1: SquareException e);
    RequestToSpeakResponse requestToSpeak() throws(1: SquareException e);
    StartLiveTalkResponse startLiveTalk() throws(1: SquareException e);
    UpdateLiveTalkAttrsResponse updateLiveTalkAttrs() throws(1: SquareException e);
    AcquireLiveTalkResponse acquireLiveTalk() throws(1: SquareException e);
}

struct CreateQrCodeForSecureResponse {
    1: string callbackUrl;
    2: i32 longPollingMaxCount;
    3: i32 longPollingIntervalSec;
    4: string nonce;
}

struct RefreshApiRetryPolicy {
    1: i64 initialDelayInMillis;
    2: i64 maxDelayInMillis;
    3: double multiplier;
    4: double jitterRate;
}

struct TokenV3IssueResult {
    1: string accessToken;
    2: string refreshToken;
    3: i64 durationUntilRefreshInSec;
    4: RefreshApiRetryPolicy refreshApiRetryPolicy;
    5: string loginSessionId;
    6: i64 tokenIssueTimeEpochSec;
}

struct QrCodeLoginV2Response {
    1: string certificate;
    2: string accessTokenV2;
    3: TokenV3IssueResult tokenV3IssueResult;
    4: string mid;
    9: i64 lastBindTimestamp;
    10: map<string, string> metaData;
}


service SecondaryQrCodeLoginService {
    CreateQrCodeForSecureResponse createQrCodeForSecure() throws(1: SecondaryQrCodeException e);
    QrCodeLoginV2Response qrCodeLoginV2ForSecure() throws(1: SecondaryQrCodeException e);
}



enum UserType {
    USER  = 1  
    BOT   = 2  
}

struct RichString {
    1: string                content;   
    2: map<string, string>   meta;      
}

struct TargetProfileDetail {
    1: i64             snapshotTimeMillis;   
    2: string          profileName;          
    3: string          picturePath;          
    4: RichString      statusMessage;        
    5: string          musicProfile;         
    6: string          videoProfile;         
    7: AvatarProfile   avatarProfile;        
    8: PictureSource   pictureSource;        
    9: string          pictureStatus;        
}

struct UserFriendDetail {
    1: i64      createdTime;      
    3: string   overriddenName;   
    4: i64      favoriteTime;     
    6: bool     hidden;           
    7: string   ringtone;         
    8: string   ringbackTone;     
}

struct BotFriendDetail {
    1: i64    createdTime;    
    4: i64    favoriteTime;   
    6: bool   hidden;         
}

struct NotFriend {
}

struct FriendDetail {
    1: UserFriendDetail   user;        
    2: BotFriendDetail    bot;         
    3: NotFriend          notFriend;   
}

struct UserBlockDetail {
    3: bool   deletedFromBlockList;   
}

struct BotBlockDetail {
    3: bool   deletedFromBlockList;   
}

struct NotBlocked {
}

struct BlockDetail {
    1: UserBlockDetail   user;         
    2: BotBlockDetail    bot;          
    3: NotBlocked        notBlocked;   
}

struct RecommendationReasonSharedChat {
    1: string   chatMid;   
}

struct RecommendationReasonReverseFriendByUserId {
}

struct RecommendationReasonReverseFriendByQRCode {
}

struct RecommendationReasonReverseFriendByPhone {
}

struct RecommendationReason {
    1: RecommendationReasonSharedChat              sharedChat;              
    2: RecommendationReasonReverseFriendByUserId   reverseFriendByUserId;   
    3: RecommendationReasonReverseFriendByQRCode   reverseFriendByQrCode;   
    4: RecommendationReasonReverseFriendByPhone    reverseFriendByPhone;    
}

struct Recommended {
    1: i64                          createdTime;   
    2: list<RecommendationReason>   reasons;       
    4: bool                         hidden;        
}

struct NotRecommended {
}

struct RecommendationDetail {
    1: Recommended      recommendationDetail;   
    2: NotRecommended   notRecommended;         
}

struct NotificationSetting {
    1: bool   mute;   
}

struct NotificationSettingEntry {
    1: NotificationSetting   notificationSetting;   
}

struct GetContactV3Response {
    1: string                     targetUserMid;              
    2: UserType                   userType;                   
    3: TargetProfileDetail        targetProfileDetail;        
    4: FriendDetail               friendDetail;               
    5: BlockDetail                blockDetail;                
    6: RecommendationDetail       recommendationDetail;       
    7: NotificationSettingEntry   notificationSettingEntry;   
}

struct GetContactsV3Response {
    1: list<GetContactV3Response>   responses;   
}

struct AddFriendByMidResponse {
}

struct GetContactCalendarEventResponse {
    1: string targetUserMid;
    2: UserType userType;
    3: ContactCalendarEvents contactCalendarEvents;
    4: i64 snapshotTimeMillis;
}

struct GetContactCalendarEventsResponse {
    1: list<GetContactCalendarEventResponse> responses;
}







service RelationService {
    GetContactsV3Response getContactsV3() throws(
        1:RejectedException be;
        2:ServerFailureException ce;
        3:TalkException te
    );

    AddFriendByMidResponse addFriendByMid() throws(
        1:RejectedException be;
        2:ServerFailureException ce;
        3:TalkException te
    );

    GetContactCalendarEventsResponse getContactCalendarEvents() throws(
        1:RejectedException be;
        2:ServerFailureException ce;
        3:TalkException te
    );
}




enum ProductType {
    STICKER = 1,
    THEME   = 2,
    STICON  = 3,
}

enum StickerResourceType {
    STATIC           = 1,
    ANIMATION        = 2,
    SOUND            = 3,
    ANIMATION_SOUND  = 4,
    POPUP            = 5,
    POPUP_SOUND      = 6,
    NAME_TEXT        = 7,
    PER_STICKER_TEXT = 8,
}

enum ThemeResourceType {
    STATIC    = 1,
    ANIMATION = 2,
}

enum SticonResourceType {
    STATIC    = 1,
    ANIMATION = 2,
}

enum ImageTextStatus {
    OK                             = 0,
    PRODUCT_UNSUPPORTED            = 1,
    TEXT_NOT_SPECIFIED             = 2,
    TEXT_STYLE_UNAVAILABLE         = 3,
    CHARACTER_COUNT_LIMIT_EXCEEDED = 4,
    CONTAINS_INVALID_WORD          = 5,
}

enum SubType {
    GENERAL  = 0,
    CREATORS = 1,
    STICON   = 2,
}

enum StickerSize {
    NORMAL = 0,
    BIG    = 1,
}

enum PopupLayer {
    FOREGROUND = 0,
    BACKGROUND = 1,
}

enum ProductSalesState {
    ON_SALE          = 0,
    OUTDATED_VERSION = 1,
    NOT_ON_SALE      = 2,
}

enum PromotionType {
    NONE    = 0,
    CARRIER = 1,
    BUDDY   = 2,
    INSTALL = 3,
    MISSION = 4,
    MUSTBUY = 5,
}

enum PromotionMissionType {
    DEFAULT    = 1,
    VIEW_VIDEO = 2,
}

enum BrandType {
    PREMIUM    = 1,
    VERIFIED   = 2,
    UNVERIFIED = 3,
}

enum EditorsPickShowcaseType {
    STATIC      = 0,
    POPULAR     = 1,
    NEW_RELEASE = 2,
}

struct Locale {
    1: required string language,
    2: required string country,
}

struct GetProductRequest {
    1: required ProductType productType,
    2: required string productId,
    3: required string carrierCode,
    4: required bool saveBrowsingHistory,
}

struct GetProductResponse {
    1: required ProductDetail productDetail,
}

struct ProductDetail {
    1: required string id,
    2: required string billingItemId,
    3: required string type,
    4: required SubType subtype,
    5: required string billingCpId,
    11: required string name,
    12: required string author,
    13: required string details,
    14: required string copyright,
    15: required string notice,
    16: required PromotionInfo promotionInfo,
    21: required i64 latestVersion,
    22: required string latestVersionString,
    23: required i64 version,
    24: required string versionString,
    25: required ApplicationVersionRange applicationVersionRange,
    31: required bool owned,
    32: required bool grantedByDefault,
    41: required i32 validFor,
    42: required i64 validUntil,
    51: required bool onSale,
    52: required set<string> salesFlag,
    53: required bool availableForPresent,
    54: required bool availableForMyself,
    61: required i32 priceTier,
    62: required Price price,
    63: required string priceInLineCoin,
    64: required Price localizedPrice,
    91: required map<string, list<string>> images,
    92: required map<string, string> attributes,
    93: required string authorId,
    94: required StickerResourceType stickerResourceType,
    95: required ProductProperty productProperty,
    96: required ProductSalesState productSalesState,
    97: required i64 installedTime,
    101: required ProductWishProperty wishProperty,
    102: required ProductSubscriptionProperty subscriptionProperty,
    103: required ProductPromotionProperty productPromotionProperty,
    104: required bool availableInCountry,
    105: required list<EditorsPickBannerForClient> editorsPickBanners,
    106: required bool ableToBeGivenAsPresent,
    107: required bool madeWithStickerMaker,
    108: required string customDownloadButtonLabel,
}

struct ApplicationVersionRange {
    1: required string lowerBound,
    2: required bool lowerBoundInclusive,
    3: required string upperBound,
    4: required bool upperBoundInclusive,
}

struct EditorsPickBannerForClient {
    1: required i64 id,
    2: required string endPageBannerImageUrl,
    3: required EditorsPickShowcaseType defaulteditorsPickShowcaseType,
    4: required bool showNewBadge,
    5: required string name,
    6: required string description,
}

struct Price {
    1: required string currency,
    2: required string amount,
    3: required string priceString,
}

struct ProductProperty {
    1: required StickerProperty stickerProperty,
    2: required ThemeProperty themeProperty,
    3: required SticonProperty sticonProperty,
}

struct StickerProperty {
    1: required bool hasAnimation,
    2: required bool hasSound,
    3: required bool hasPopup,
    4: required StickerResourceType stickerResourceType,
    5: required string stickerOptions,
    6: required i32 compactStickerOptions,
    7: required string stickerHash,
    9: required list<string> stickerIds,
    10: required ImageTextProperty nameTextProperty,
    11: required bool availableForPhotoEdit,
    12: required map<string, string> stickerDefaultTexts,
    13: required StickerSize stickerSize,
    14: required PopupLayer popupLayer,
    15: required bool cpdProduct,
    16: required bool availableForCombinationSticker,
}

struct ThemeProperty {
    1: required string thumbnail,
    2: required ThemeResourceType themeResourceType,
}

struct SticonProperty {
    2: required list<string> sticonIds,
    3: required bool availableForPhotoEdit,
    4: required SticonResourceType sticonResourceType,
    5: required list<list<string>> endPageMainImages,
}

struct ImageTextProperty {
    1: required ImageTextStatus status,
    2: required string plaintext,
    3: required i32 nameTextMaxCharacterCount,
    4: required string encryptedText,
}

struct LpPromotionProperty {
    1: required string landingPageUrl,
    2: required string label,
    3: required string buttonLabel,
}

struct ProductWishProperty {
    1: required i64 totalCount,
}

struct ProductSubscriptionProperty {
    1: required bool availableForSubscribe,
    2: required i32 subscriptionAvailability,
}

struct ProductPromotionProperty {
    1: required LpPromotionProperty lpPromotionProperty,
}

struct PromotionDetail {
    1: required PromotionBuddyInfo promotionBuddyInfo,
    2: required PromotionInstallInfo promotionInstallInfo,
    3: required PromotionMissionInfo promotionMissionInfo,
}

struct PromotionInfo {
    1: required PromotionType promotionType,
    2: required PromotionDetail promotionDetail,
    51: required PromotionBuddyInfo buddyInfo,
}

struct PromotionBuddyInfo {
    1: required string buddyMid,
    2: required PromotionBuddyDetail promotionBuddyDetail,
    3: required bool showBanner,
}

struct PromotionInstallInfo {
    1: required string downloadUrl,
    2: required string customUrlSchema,
}

struct PromotionMissionInfo {
    1: required PromotionMissionType promotionMissionType,
    2: required bool missionCompleted,
    3: required string downloadUrl,
    4: required string customUrlSchema,
    5: required string oaMid,
}

struct PromotionBuddyDetail {
    1: required string searchId,
    2: required ContactStatus contactStatus,
    3: required string name,
    4: required string pictureUrl,
    5: required string statusMessage,
    6: required BrandType brandType,
}

struct PurchaseOrder {
    1: required string shopId,
    2: required string productId,
    5: required string recipientMid,
    11: required Price price,
    12: required bool enableLinePointAutoExchange,
    21: required Locale locale,
    31: required map<string, string> presentAttributes,
}

struct PurchaseOrderResponse {
    1: required string orderId,
    11: required map<string, string> attributes,
    12: required string billingConfirmUrl,
}

struct PurchaseRecordList {
    1: required list<PurchaseRecord> purchaseRecords,
    2: required i32 offset,
    3: required i32 totalSize,
}

struct PurchaseRecord {
    1: required ProductDetail productDetail,
    11: required i64 purchasedTime,
    21: required string giver,
    22: required string recipient,
    31: required Price purchasedPrice,
}

struct DetailedProductList {
    1: required list<ProductDetail> productList,
    2: required i32 offset,
    3: required i32 totalSize,
}

struct CreateCombinationStickerResponse {
    1: required string id,
}

enum ProductAvailability {
    PURCHASE_ONLY            = 0,
    PURCHASE_OR_SUBSCRIPTION = 1,
    SUBSCRIPTION_ONLY        = 2,
}

struct ProductSearchSummary {
    1: required string id,
    2: required ProductType type,
    3: required string name,
    4: required string author,
    5: required PromotionInfo promotionInfo,
    6: required i64 version,
    7: required bool newFlag,
    8: required i32 priceTier,
    9: required string priceInLineCoin,
    10: required ProductProperty property,
    11: required SubType subType,
    12: required bool onSale,
    13: required bool availableForPresent,
    14: required bool availableForPurchase,
    15: required i32 validDays,
    16: required string authorId,
    17: required bool bargainFlag,
    18: required string copyright,
    19: required ProductAvailability availability,
    20: required string interactionEventParameter,
    21: required set<i64> editorsPickIds,
}

enum DemographicGenderType {
    ALL    = 0,
    MALE   = 1,
    FEMALE = 2,
}

enum DemographicAgeType {
    ALL        = 0,
    AGE_0_19   = 1,
    AGE_20_29  = 2,
    AGE_30_39  = 3,
    AGE_40_INF = 4,
    AGE_40_49  = 5,
    AGE_50_INF = 6,
}

enum ShowcaseType {
    POPULAR                    = 0,
    NEW_RELEASE                = 1,
    EVENT                      = 2,
    RECOMMENDED                = 3,
    POPULAR_WEEKLY             = 4,
    POPULAR_MONTHLY            = 5,
    POPULAR_RECENTLY_PUBLISHED = 6,
    BUDDY                      = 7,
    EXTRA_EVENT                = 8,
    BROWSING_HISTORY           = 9,
    POPULAR_TOTAL_SALES        = 10,
    NEW_SUBSCRIPTION           = 11,
    POPULAR_SUBSCRIPTION_30D   = 12,
    CPD_STICKER                = 13,
    POPULAR_WITH_FREE          = 14,
}

struct DemographicType {
    1: required DemographicGenderType demographicGenderType,
    2: required DemographicAgeType demographicAgeType,
    3: required bool defaultOrder,
}

struct ShowcaseV3 {
    1: required list<ProductSearchSummary> productList,
    2: required string continuationToken,
    3: required i64 totalSize,
    4: required ShowcaseType showcaseType,
    5: required ProductType productType,
    6: required SubType subType,
    7: required DemographicType demographicType,
}

struct StickerIdRange {
    1: required i64 start,
    2: required i32 size,
}

struct StickerSummary {
    1: required list<StickerIdRange> stickerIdRanges,
    2: required i64 suggestVersion,
    3: required string stickerHash,
    4: required bool defaultDisplayOnKeyboard,
    5: required StickerResourceType stickerResourceType,
    6: required ImageTextProperty nameTextProperty,
    7: required bool availableForPhotoEdit,
    8: required PopupLayer popupLayer,
    9: required StickerSize stickerSize,
    10: required bool availableForCombinationSticker,
}

struct ThemeSummary {
    1: required string imagePath,
    2: required i64 version,
    3: required string versionString,
}

struct SticonSummary {
    1: required i64 suggestVersion,
    2: required bool availableForPhotoEdit,
    3: required SticonResourceType sticonResourceType,
}

struct ProductTypeSummary {
    1: required StickerSummary stickerSummary,
    2: required ThemeSummary themeSummary,
    3: required SticonSummary sticonSummary,
}

struct ProductSummary {
    1: required string id,
    11: required string name,
    21: required i64 latestVersion,
    25: required ApplicationVersionRange applicationVersionRange,
    32: required bool grantedByDefault,
    92: required map<string, string> attributes,
    93: required ProductTypeSummary productTypeSummary,
    94: required i64 validUntil,
    95: required i32 validFor,
    96: required i64 installedTime,
    97: required ProductAvailability availability,
    98: required string authorId,
    99: required bool canAutoDownload,
    100: required PromotionInfo promotionInfo,
}

struct ProductSummaryList {
    1: required list<ProductSummary> productList,
    2: required i32 offset,
    3: required i32 totalSize,
}

struct ProductValidationScheme {
    10: required string key,
    11: required i64 offset,
    12: required i64 size,
}

struct ProductValidationResult {
    1: required bool validated,
}

struct ShopUpdates {
    1: required string shopId,
    11: required i64 latestUpdateTime,
}

struct SearchProductsV2Response {
    1: required list<ProductSearchSummary> results,
    2: required string continuationToken,
    3: required i64 totalSize,
}

struct EditorsPickBanner {
    1: required i64 id,
    2: required string imageUrl,
    3: required string homeBannerImageUrl,
    4: required string showcaseBannerImageUrl,
    5: required list<EditorsPickShowcaseType> enableEditorsPickShowcaseTypes,
    6: required EditorsPickShowcaseType defaulteditorsPickShowcaseType,
    7: required string homeBannerV2ImageUrl,
    8: required string name,
    9: required bool containsProducts,
    10: required i64 displayPeriodBegin,
    11: required string description,
    12: required bool showNewBadge,
}

struct AuthorForShowcase {
    1: required i64 authorId,
    2: required list<ProductSearchSummary> productList,
    3: required i64 productTotalSize,
}

struct ImageSearchSummary {
    1: required string imageId,
    2: required ProductSearchSummary product,
}

struct KeywordImageList {
    1: required string tagId,
    2: required string keyword,
    3: required list<ImageSearchSummary> imageList,
}

struct URLItem {
    1: required string title,
    2: required string imageUrl,
    3: required string url,
}

struct EditorsPickContent {
    1: required URLItem urlItem,
    2: required ProductDetail productDetail,
}

enum EditorsPickContentType {                 // ContentType
    STICKER = 1,
    URL     = 2,
    THEME   = 3,
    EMOJI   = 4,
}

struct EditorsPick {
    1: required EditorsPickContentType contentType,
    2: required EditorsPickContent editorsPickContent,
}

struct EditorsPickTab {
    1: required i64 editorsPickId,
    2: required string name,
    3: required ShowcaseType showcaseType,
}

struct EditorsPickShowcase {
    1: required i64 id,
    2: required string name,
    3: required EditorsPickBanner banner,
    4: required list<EditorsPick> editorsPicks,
    5: required string continuationToken,
    6: required i32 totalSize,
    7: required string description,
    8: required EditorsPickShowcaseType type,
    9: required list<EditorsPickTab> tabs,
}

struct Category {
    1: required i64 id,
    11: required string name,
    12: required bool newFlag,
    13: required i32 productCount,
    14: required string thumbnailUrl,
}

enum TagType {
    UNKNOWN   = 0,
    CHARACTER = 1,
    TASTE     = 2,
}

struct Tag {
    1: required i64 id,
    11: required string name,
    12: required TagType tagType,
    13: required i32 productCount,
    14: required string thumbnailUrl,
}

struct ProductList {
    1: required list<ProductDetail> productList,
    2: required i32 offset,
    3: required i32 totalSize,
    11: required string title,
}

struct CategoryProductList {
    1: required Category category,
    2: required ProductList productList,
}

struct AggregatedHomeV2Response {
    1: required list<ShowcaseV3> showcases,
    2: required list<EditorsPickBanner> editorsPickBanners,
    3: required list<AuthorForShowcase> authorList,
    4: required list<KeywordImageList> keywordStickerList,
    5: required EditorsPickShowcase detailedEditorsPick,
    6: required list<CategoryProductList> detailedCategoryList,
    7: required list<Category> categoryList,
    8: required list<Tag> tagList,
}

enum CategoryType {
    GENERAL_CATEGORY = 1,
    CREATORS_TAG     = 2,
}

struct AggregatedCategory {
    1: required i64 id,
    2: required CategoryType categoryType,
    3: required string name,
    4: required i32 productCount,
    5: required string thumbnailUrl,
}

struct ListContentData {
    1: required ShowcaseV3 showcase,
    2: required list<EditorsPickBanner> editorsPickBanners,
    3: required list<AggregatedCategory> categories,
}

struct ListContent {
    1: required ListContentData contentData,
    2: required string localizedTitle,
    3: required string tsKey,
    4: required string moreLinkFragment,
}

struct AggregatedHomeNativeResponse {
    1: required list<ListContent> listContents,
}

struct DynamicHomeNativeResponse {
    1: required list<ListContent> listContents,
}

struct TagsProductList {
    1: required Tag tasteTag,
    2: required Tag characterTag,
    3: required list<ProductSearchSummary> products,
}

struct AggregatedPremiumHomeResponse {
    1: required list<ShowcaseV3> showcases,
    2: required list<EditorsPickBanner> editorsPickBanners,
    3: required AuthorForShowcase popularCreator,
    4: required TagsProductList featuredCategory,
    5: required list<TagsProductList> categoryList,
    6: required ShowcaseV3 browsingHistory,
    7: required ShowcaseV3 subscriptionSlotHistory,
}

struct AggregatedShowcaseV4 {
    1: required list<ShowcaseV3> showcases,
}

struct GetRecommendationResponse {
    1: required list<ProductSearchSummary> results,
    2: required string continuationToken,
    3: required i64 totalSize,
}

struct AuthorListResponse {
    1: required list<AuthorForShowcase> authorList,
    2: required i64 totalSize,
    3: required string continuationToken,
}

struct ProductResourceType {
    1: required StickerResourceType stickerResourceType,
    2: required ThemeResourceType themeResourceType,
    3: required SticonResourceType sticonResourceType,
}

struct LatestProductByAuthorItem {
    1: required string productId,
    2: required string displayName,
    3: required i64 version,
    4: required bool newFlag,
    5: required ProductResourceType productResourceType,
    6: required PopupLayer popupLayer,
}

struct LatestProductsByAuthorResponse {
    1: required i64 authorId,
    2: required string author,
    3: required list<LatestProductByAuthorItem> items,
}

struct GetExperimentsResponse {
    1: required map<string, string> variables,
}

struct ProductSummaryForAutoSuggest {
    1: required string id,
    2: required i64 version,
    3: required string name,
    4: required StickerResourceType stickerResourceType,
    5: required i64 suggestVersion,
    6: required PopupLayer popupLayer,
    7: required ProductType type,
    8: required ProductResourceType resourceType,
    9: required StickerSize stickerSize,
}

struct AutoSuggestionShowcaseResponse {
    1: required list<ProductSummaryForAutoSuggest> productList,
    2: required i64 totalSize,
}

struct SuggestResource {
    1: required string dataUrl,
    2: required i64 version,
    3: required i64 updatedTime,
}

struct SuggestDictionarySetting {
    1: required string language,
    2: required string name,
    3: required bool preload,
    4: required SuggestResource suggestResource,
    5: required map<i64, string> patch,
    6: required SuggestResource suggestTagResource,
    7: required map<i64, string> tagPatch,
    8: required SuggestResource corpusResource,
}

struct GetSuggestDictionarySettingResponse {
    1: required list<SuggestDictionarySetting> results,
}

struct GetRecommendOaResponse {
    1: required list<string> buddyMids,
}

struct GetSuggestResourcesResponse {
    1: required map<i64, SuggestResource> suggestResources,
}

struct GetSuggestResourcesV2Response {
    1: required map<string, SuggestResource> suggestResources,
}

struct GetTagClusterFileResponse {
    1: required string path,
    2: required i64 updatedTimeMillis,
}

struct GetResourceFileReponse {
    1: required GetTagClusterFileResponse tagClusterFileResponse,
}

struct BrowsingHistory {
    1: required ProductSearchSummary productSearchSummary,
    2: required i64 browsingTime,
}

struct GetBrowsingHistoryResponse {
    1: required list<BrowsingHistory> browsingHistory,
    2: required string continuationToken,
    3: required i32 totalSize,
}

struct DeleteAllBrowsingHistoryResponse {
}

struct SticonProductMapping {
    1: required string productId,
    2: required string oldProductId,
    3: required map<string, string> newToOldSticonIdMapping,
    4: required i32 oldPackageVersion,
    5: required i32 oldMetaVersion,
    6: required i64 stickerPackageId,
    7: required i32 stickerPackageVersion,
    8: required map<string, string> stickerIds,
}

struct GetOldSticonMappingResponse {
    1: required list<SticonProductMapping> sticonProductMappings,
    2: required i64 updatedTimeMillis,
    3: required bool updated,
}

struct SimilarImageShowcase {
    1: required ImageSearchSummary chosenImage,
    2: required list<ImageSearchSummary> similarImageList,
    3: required string continuationToken,
}

struct CustomizeImageTextResponse {
    1: required ImageTextProperty nameTextProperty,
}

enum SubscriptionPlanAvailability {
    AVAILABLE         = 0,
    DIFFERENT_STORE   = 1,
    NOT_STUDENT       = 2,
    ALREADY_PURCHASED = 3,
}

enum SubscriptionServiceType {
    STICKERS_PREMIUM = 1,
}

enum SubscriptionPlanTarget {
    GENERAL = 1,
    STUDENT = 2,
}

enum SubscriptionPlanType {
    MONTHLY = 1,
    YEARLY  = 2,
}

enum SubscriptionPlanTier {
    BASIC  = 1,
    DELUXE = 2,
}

enum SubscriptionSlotModificationResult {
    OK              = 0,
    UNKNOWN         = 1,
    NO_SUBSCRIPTION = 2,
    EXISTS          = 3,
    NOT_FOUND       = 4,
    EXCEEDS_LIMIT   = 5,
    NOT_AVAILABLE   = 6,
}

enum SubscriptionBillingResult {
    OK                     = 0,
    UNKNOWN                = 1,
    NOT_SUPPORTED          = 2,
    NO_SUBSCRIPTION        = 3,
    SUBSCRIPTION_EXISTS    = 4,
    NOT_AVAILABLE          = 5,
    CONFLICT               = 6,
    OUTDATED_VERSION       = 7,
    NO_STUDENT_INFORMATION = 8,
    ACCOUNT_HOLD           = 9,
    RETRY_STATE            = 10,
}

enum SubscriptionCampaignType {
    MISSION    = 1,
    FREE_TRIAL = 2,
}

enum SubscriptionSortType {
    DATE_ASC  = 1,
    DATE_DESC = 2,
}

enum StartBundleSubscriptionResult {
    OK                = 0,
    UNKNOWN           = 1,
    INVALID_PARAMETER = 2,
    NOT_ELIGIBLE      = 3,
    CONFLICT          = 4,
    ACCOUNT_HOLD      = 5,
    RETRY_STATE       = 6,
}

enum StopBundleSubscriptionResult {
    OK                = 0,
    INVALID_PARAMETER = 1,
    NOT_FOUND         = 2,
    NOT_SUPPORTED     = 3,
    CONFLICT          = 4,
    NOT_ELIGIBLE      = 5,
}

enum GetSubscriptionCouponCodeResult {
    OK             = 0,
    UNKNOWN        = 1,
    NOT_SUPPORTED  = 2,
    NOT_AVAILABLE  = 3,
    NOT_APPLICABLE = 4,
}

enum GetFriendStatusWithPremiumOaResult {
    FRIEND     = 0,
    BLOCKED    = 1,
    NOT_FRIEND = 2,
    ERROR      = 3,
}

enum SubscriptionCouponCampaignStatus {
    OK             = 0,
    UNKNOWN        = 1,
    NOT_SUPPORTED  = 2,
    NOT_ACTIVE     = 3,
    NOT_APPLICABLE = 4,
}

enum AcceptSubscriptionAgreementResult {
    OK              = 0,
    UNKNOWN         = 1,
    NOT_SUPPORTED   = 2,
    NO_SUBSCRIPTION = 3,
}

enum StoreCode {
    GOOGLE     = 0,
    APPLE      = 1,
    WEBSTORE   = 2,
    LINEMO     = 3,
    LINE_MUSIC = 4,
    LYP        = 5,
    TW_CHT     = 6,
    FREEMIUM   = 7,
}

struct SubscriptionPlan {
    1: required string billingItemId,
    2: required SubscriptionServiceType subscriptionService,
    3: required SubscriptionPlanTarget target,
    4: required SubscriptionPlanType type,
    5: required string period,
    6: required string freeTrial,
    7: required string localizedName,
    8: required Price price,
    9: required SubscriptionPlanAvailability availability,
    10: required string cpId,
    11: required string nameKey,
    12: required SubscriptionPlanTier tier,
}

struct GetSubscriptionPlansResponse {
    1: required list<SubscriptionPlan> plans,
}

struct SubscriptionStatus {
    1: required string billingItemId,
    2: required SubscriptionServiceType subscriptionService,
    3: required string period,
    4: required string localizedName,
    5: required bool freeTrial,
    6: required bool expired,
    7: required i64 validUntil,
    8: required i32 maxSlotCount,
    9: required SubscriptionPlanTarget target,
    10: required SubscriptionPlanType type,
    11: required StoreCode storeCode,
    12: required string nameKey,
    13: required SubscriptionPlanTier tier,
    14: required bool accountHold,
    15: required map<ProductType, i32> maxSlotCountsByProductType,
    16: required bool agreementAccepted,
}

struct GetSubscriptionStatusResponse {
    1: required map<i32, SubscriptionStatus> subscriptions,
    2: required bool hasValidStudentInformation,
    3: required map<i32, list<SubscriptionStatus>> otherOwnedSubscriptions,
}

struct GetProductSummariesInSubscriptionSlotsResponse {
    1: required list<ProductSummary> products,
    2: required string continuationToken,
    3: required i64 totalSize,
    4: required i32 maxSlotCount,
}

struct AddProductToSubscriptionSlotResponse {
    1: required SubscriptionSlotModificationResult result,
}

struct AddThemeToSubscriptionSlotResponse {
    1: required SubscriptionSlotModificationResult result,
}

struct RemoveProductFromSubscriptionSlotResponse {
    1: required SubscriptionSlotModificationResult result,
}

struct PurchaseSubscriptionResponse {
    1: required SubscriptionBillingResult result,
    2: required string orderId,
    3: required string confirmUrl,
}

struct ChangeSubscriptionResponse {
    1: required SubscriptionBillingResult result,
    2: required string orderId,
    3: required string confirmUrl,
}

struct RestoreSubscriptionResponse {
    1: required SubscriptionBillingResult result,
    2: required string orderId,
    3: required string confirmUrl,
}

struct GetProductsByTagsV2Response {
    1: required list<ProductSearchSummary> results,
    2: required string continuationToken,
    3: required i64 totalSize,
}

struct StudentInformation {
    1: required string schoolName,
    2: required string graduationDate,
}

struct GetStudentInformationResponse {
    1: required StudentInformation studentInformation,
    2: required bool isValid,
}

struct SaveStudentInformationResponse {
}

struct PurchasedSubscription {
    1: required string orderId,
    2: required SubscriptionServiceType subscriptionService,
    3: required string billingItemId,
    4: required SubscriptionPlanType type,
    5: required string localizedName,
    6: required i64 purchasedTime,
    7: required i64 validUntil,
    8: required Price price,
    9: required string nameKey,
    10: required SubscriptionPlanTier tier,
}

struct GetPurchasedSubscriptionsResponse {
    1: required list<PurchasedSubscription> subscriptions,
    2: required string continuationToken,
    3: required i64 totalSize,
}

struct FindRestorablePlanResponse {
    1: required SubscriptionBillingResult result,
    2: required string billingItemId,
    3: required string storeOrderId,
    4: required string originalStoreOrderId,
    5: required string orderId,
    6: required string mid,
}

struct SubscriptionMissionCampaign {
    1: required ProductType productType,
    2: required string productId,
}

struct SubscriptionCampaignPayload {
    1: required SubscriptionMissionCampaign mission,
}

struct SubscriptionCampaign {
    1: required string campaignId,
    2: required i64 fromInclusive,
    3: required i64 toExclusive,
    4: required SubscriptionCampaignType type,
    5: required SubscriptionCampaignPayload payload,
}

struct GetSubscriptionCampaignsResponse {
    1: required list<SubscriptionCampaign> campaigns,
}

struct GetSubscriptionRecommendationsResponse {
    1: required list<ProductSearchSummary> products,
}

struct InteractionEventResponse {
    1: required i32 responseStatus,
}

struct LibraExperiment {
    1: required string experimentId,
    2: required string groupId,
}

struct GetExperimentsV2Response {
    1: required map<string, LibraExperiment> experiments,
}

enum BirthdayGiftAssociationVerifyTokenStatus {
    VALID   = 0,
    INVALID = 1,
}

struct BirthdayGiftAssociationVerifyResponse {
    1: required BirthdayGiftAssociationVerifyTokenStatus tokenStatus,
    2: required string recipientUserMid,
}

struct SubscriptionSlotHistory {
    1: required ProductSearchSummary product,
    2: required i64 addedTime,
    3: required i64 removedTime,
}

struct GetSubscriptionSlotHistoryResponse {
    1: required list<SubscriptionSlotHistory> history,
    2: required string continuationToken,
    3: required i64 totalSize,
}

struct PopupDisplaySettings {
    1: required set<i32> pages,
    2: required set<string> editorsPickIds,
}

struct PopupPage {
    1: required string imageUrl,
    2: required string title,
    3: required string body,
}

struct PopupActionButton {
    1: required string label,
    2: required string actionUrl,
    3: required string textColorCode,
    4: required string backgroundColorCode,
}

struct PopupDismissButton {
    1: required string label,
    2: required string textColorCode,
    3: required string backgroundColorCode,
}

struct PopupContent {
    1: required list<PopupPage> pages,
    2: required PopupActionButton actionButton,
    3: required PopupDismissButton dismissButton,
}

enum PopupDesignTemplate {
    FIXED = 0,
}

enum PopupDisplayCount {
    ONCE = 0,
}

enum PopupVisualType {
    BASIC      = 0,
    FULLSCREEN = 1,
}

struct ShopPopup {
    1: required string popupId,
    2: required PopupDisplaySettings displaySettings,
    3: required PopupDisplayCount displayCount,
    4: required PopupContent content,
    5: required i32 displayPriority,
    6: required PopupVisualType visualType,
    7: required i32 displayIntervalInDays,
}

struct GetPopupsResponse {
    1: required list<ShopPopup> popups,
}

struct GetSubscriptionSlotStatusResponse {
    1: required set<string> productIdsInSlots,
    2: required i32 usedSlotCount,
    3: required i32 maxSlotCount,
}

struct GetProductKeyboardListResponse {
    1: required ProductType productType,
    2: required list<string> keyboardProductIds,
}

struct GetMusicSubscriptionStatusResponse {
    1: required i64 validUntil,
    2: required bool expired,
    3: required bool isStickersPremiumEnabled,
}

struct StartBundleSubscriptionResponse {
    1: required StartBundleSubscriptionResult result,
}

struct StopBundleSubscriptionResponse {
    1: required StopBundleSubscriptionResult result,
}

struct GetSubscriptionCouponCodeResponse {
    1: required GetSubscriptionCouponCodeResult result,
    2: required string couponCode,
}

struct GetSubscriptionCouponCampaignResponse {
    1: required SubscriptionCouponCampaignStatus status,
}

struct PopupModel {
    1: required string popupId,
    2: required bool active,
}

struct GetPopupDisplayStatusResponse {
    1: required map<string, PopupModel> popups,
}

struct GetFilteredProductsResponse {
    1: required list<ProductSearchSummary> results,
    2: required string continuationToken,
    3: required i64 totalSize,
}

struct GetProductLatestVersionForUserResponse {
    1: required i64 latestVersion,
    2: required string latestVersionString,
}

struct GetSubscriptionAgreementStatusResponse {
    1: required bool accepted,
}

struct AcceptSubscriptionAgreementResponse {
    1: required AcceptSubscriptionAgreementResult result,
}

struct ShouldShowWelcomeStickerBannerResponse {
    1: required bool shouldShowBanner,
}


service ShopService {
    CreateCombinationStickerResponse createCombinationSticker() throws(1: ShopException e),
    GetProductResponse getProductV2() throws(1: ShopException e),
    PurchaseOrderResponse placePurchaseOrderForFreeProduct() throws(1: ShopException e),
    PurchaseOrderResponse placePurchaseOrderWithLineCoin() throws(1: ShopException e),
    void canReceivePresent() throws(1: ShopException e),
    PurchaseRecordList getSentPresents() throws(1: ShopException e),
    PurchaseRecordList getPurchasedProducts() throws(1: ShopException e),
    PurchaseRecordList getReceivedPresents() throws(1: ShopException e),
    DetailedProductList getOwnedProducts() throws(1: ShopException e),
    ShowcaseV3 getShowcaseV3() throws(1: ShopException e),
    ProductDetail getProduct() throws(1: ShopException e),
    ProductDetail getProductByVersion() throws(1: ShopException e),
    PurchaseOrderResponse placePurchaseOrderWithIAP() throws(1: ShopException e),
    ProductSummaryList getOwnedProductSummaries() throws(1: ShopException e),
    void notifyProductEvent() throws(1: ShopException e),
    ProductValidationScheme getProductValidationScheme() throws(1: ShopException e),
    ProductValidationResult validateProduct() throws(1: ShopException e),
    DetailedProductList getProductsByBillingItemId() throws(1: ShopException e),
    ShopUpdates getUpdates() throws(1: ShopException e),
    SearchProductsV2Response searchProductsV2() throws(1: ShopException e),
    AggregatedHomeV2Response getAggregatedHomeV2() throws(1: ShopException e),
    AggregatedHomeNativeResponse getAggregatedHomeNative() throws(1: ShopException e),
    DynamicHomeNativeResponse getDynamicHomeNative() throws(1: ShopException e),
    AggregatedPremiumHomeResponse getAggregatedPremiumHome() throws(1: ShopException e),
    AggregatedShowcaseV4 getAggregatedShowcaseV4() throws(1: ShopException e),
    ProductList getRecommendationForUser() throws(1: ShopException e),
    GetRecommendationResponse getRecommendationList() throws(1: ShopException e),
    list<Category> getCategories() throws(1: ShopException e),
    ProductList getProductsByCategory() throws(1: ShopException e),
    list<Tag> getTags() throws(1: ShopException e),
    ProductList getProductsByTags() throws(1: ShopException e),
    void buyMustbuyProduct() throws(1: ShopException e),
    ProductList getProductsByAuthor() throws(1: ShopException e),
    AuthorListResponse getAuthorList() throws(1: ShopException e),
    LatestProductsByAuthorResponse getAuthorsLatestProducts() throws(1: ShopException e),
    EditorsPickShowcase getEditorsPickShowcase() throws(1: ShopException e),
    GetExperimentsResponse getExperiments() throws(1: ShopException e),
    AutoSuggestionShowcaseResponse getAutoSuggestionShowcase() throws(1: ShopException e),
    GetSuggestDictionarySettingResponse getSuggestDictionarySetting() throws(1: ShopException e),
    GetRecommendOaResponse getRecommendOa() throws(1: ShopException e),
    GetSuggestResourcesResponse getSuggestResources() throws(1: ShopException e),
    GetSuggestResourcesV2Response getSuggestResourcesV2() throws(1: ShopException e),
    GetResourceFileReponse getResourceFile() throws(1: ShopException e),
    GetBrowsingHistoryResponse getBrowsingHistory() throws(1: ShopException e),
    DeleteAllBrowsingHistoryResponse deleteAllBrowsingHistory() throws(1: ShopException e),
    GetOldSticonMappingResponse getOldSticonMapping() throws(1: ShopException e),
    void sendReport() throws(1: ShopException e),
    SimilarImageShowcase getSimilarImageShowcase() throws(1: ShopException e),
    CustomizeImageTextResponse previewCustomizedImageText() throws(1: ShopException e),
    CustomizeImageTextResponse setCustomizedImageText() throws(1: ShopException e),
    GetSubscriptionPlansResponse getSubscriptionPlans() throws(1: ShopException e),
    GetSubscriptionStatusResponse getSubscriptionStatus() throws(1: ShopException e),
    GetProductSummariesInSubscriptionSlotsResponse getProductSummariesInSubscriptionSlots() throws(1: ShopException e),
    AddProductToSubscriptionSlotResponse addProductToSubscriptionSlot() throws(1: ShopException e),
    AddThemeToSubscriptionSlotResponse addThemeToSubscriptionSlot() throws(1: ShopException e),
    RemoveProductFromSubscriptionSlotResponse removeProductFromSubscriptionSlot() throws(1: ShopException e),
    PurchaseSubscriptionResponse purchaseSubscription() throws(1: ShopException e),
    ChangeSubscriptionResponse changeSubscription() throws(1: ShopException e),
    RestoreSubscriptionResponse restoreSubscription() throws(1: ShopException e),
    GetProductsByTagsV2Response getProductsByTagsV2() throws(1: ShopException e),
    GetStudentInformationResponse getStudentInformation() throws(1: ShopException e),
    SaveStudentInformationResponse saveStudentInformation() throws(1: ShopException e),
    ShowcaseV3 getSubscriptionShowcase() throws(1: ShopException e),
    GetPurchasedSubscriptionsResponse getPurchasedSubscriptions() throws(1: ShopException e),
    FindRestorablePlanResponse findRestorablePlan() throws(1: ShopException e),
    GetSubscriptionCampaignsResponse getSubscriptionCampaigns() throws(1: ShopException e),
    GetSubscriptionRecommendationsResponse getSubscriptionRecommendations() throws(1: ShopException e),
    InteractionEventResponse produceInteractionEvent() throws(1: ShopException e),
    GetExperimentsV2Response getExperimentsV2() throws(1: ShopException e),
    BirthdayGiftAssociationVerifyResponse verifyBirthdayGiftAssociationToken() throws(1: ShopException e),
    GetSubscriptionSlotHistoryResponse getSubscriptionSlotHistory() throws(1: ShopException e),
    GetPopupsResponse getPopups() throws(1: ShopException e),
    GetSubscriptionSlotStatusResponse getSubscriptionSlotStatus() throws(1: ShopException e),
    GetProductKeyboardListResponse getProductKeyboardGlobalSetting() throws(1: ShopException e),
    GetMusicSubscriptionStatusResponse getMusicSubscriptionStatus() throws(1: ShopException e),
    StartBundleSubscriptionResponse startBundleSubscription() throws(1: ShopException e),
    StopBundleSubscriptionResponse stopBundleSubscription() throws(1: ShopException e),
    GetSubscriptionCouponCodeResponse getSubscriptionCouponCode() throws(1: ShopException e),
    GetSubscriptionCouponCampaignResponse getSubscriptionCouponCampaign() throws(1: ShopException e),
    GetPopupDisplayStatusResponse getPopupDisplayStatus() throws(1: ShopException e),
    GetFilteredProductsResponse getFilteredProducts() throws(1: ShopException e),
    GetProductLatestVersionForUserResponse getProductLatestVersionForUser() throws(1: ShopException e),
    GetSubscriptionAgreementStatusResponse getSubscriptionAgreementStatus() throws(1: ShopException e),
    AcceptSubscriptionAgreementResponse acceptSubscriptionAgreement() throws(1: ShopException e),
    ShouldShowWelcomeStickerBannerResponse shouldShowWelcomeStickerBanner() throws(1: ShopException e),
}

struct StickerDisplayData {
    1: required string stickerHash,
    2: required StickerResourceType stickerResourceType,
    3: required ImageTextProperty nameTextProperty,
    4: required PopupLayer popupLayer,
    5: required StickerSize stickerSize,
    6: required ProductAvailability productAvailability,
    7: required i32 height,
    8: required i32 width,
    9: required i64 version,
    10: required bool availableForCombinationSticker,
}

struct DisplayData {
    1: required StickerDisplayData stickerSummary,
}

struct CollectionItem {
    1: required string itemId,
    2: required string productId,
    3: required DisplayData displayData,
    4: required i32 sortId,
}

struct Collection {
    1: required string collectionId,
    2: required list<CollectionItem> items,
    3: required ProductType productType,
    4: required i64 createdTimeMillis,
    5: required i64 updatedTimeMillis,
}

struct GetUserCollectionsResponse {
    1: required list<Collection> collections,
    2: required bool updated,
}

struct CreateCollectionForUserResponse {
    1: required Collection collection,
}

struct AddItemToCollectionResponse {
}

struct RemoveItemFromCollectionResponse {
}

struct IsProductForCollectionsResponse {
    1: required bool isAvailable,
}


service ShopCollectionService {
    GetUserCollectionsResponse getUserCollections() throws(1: ShopException e),
    CreateCollectionForUserResponse createCollectionForUser() throws(1: ShopException e),
    AddItemToCollectionResponse addItemToCollection() throws(1: ShopException e),
    RemoveItemFromCollectionResponse removeItemFromCollection() throws(1: ShopException e),
    IsProductForCollectionsResponse isProductForCollections() throws(1: ShopException e),
}