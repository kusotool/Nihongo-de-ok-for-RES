// ==UserScript==
// @name         Nihongo de ok for RES settings
// @namespace    nihongo-de-ok-for-res-settings
// @version      0.2.1
// @description  Reddit Enhancement Suite(RES)の設定画面を日本語に翻訳します（RES v4.6.0対応）
// @author       kusotool
// @include      http://*.reddit.com/*
// @include      https://*.reddit.com/*
// @grant        none
// @license      GNU General Public License version 3 or later
// ==/UserScript==
//
//	This program is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published by
//	the Free Software Foundation, either version 3 of the License, or
//	(at your option) any later version.
//
//	This program is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//
//	You should have received a copy of the GNU General Public License
//	along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

/* jshint -W097 */
'use strict';

// Your code here...
var resja_debug = false;
var prev_href = "";

function TranslateCategory(en, jp) {
    var arrayTarget = document.getElementsByClassName("categoryButton");
    for(var i = 0; i < arrayTarget.length; i++){
        var target = arrayTarget[i];
        if(target.getAttribute("data-category") === en){
            target.innerHTML = jp + "<br>　" + target.innerHTML;
        }
    }
}

function TranslateModule(en, jp, arrayRightPaneTranslateData, funcCustom) {
    var arrayTarget = document.getElementsByClassName("moduleButton");
    for(var i = 0; i < arrayTarget.length; i++){
        var target = arrayTarget[i];
        if(target.getAttribute("data-module") === en){
            target.innerHTML = jp + "<br>　" + target.innerHTML;
            target.addEventListener("click", function() {
                //そのまま呼び出すと翻訳後に上書きされるため、遅らせる
                setTimeout(function(){
                    TranslateRightPane(arrayRightPaneTranslateData);
                    if(typeof(funcCustom) === "function") funcCustom();
                },1);
            });
        }
    }
}

function TranslateRightPane(arrayRightPaneTranslateData) {
    if(resja_debug) { 
        document.getElementsByClassName("moduleName")[0].innerHTML += "[" + arrayRightPaneTranslateData.count + "]";
    }

    Translate(document.getElementById("RESConfigPanelOptions"), arrayRightPaneTranslateData);
}

function Translate(e, td){
    if(!e){
        return;
    }
    
    if(e.getAttribute && e.getAttribute("class") === "optionTitle"){
        Translate(e.nextSibling, td);
        return;
    }
    else if(e.innerHTML && typeof(td[e.innerHTML]) === "string"){
        e.innerHTML = td[e.innerHTML];
    }
    else if(e.nodeValue && typeof(td[e.nodeValue]) === "string"){
        e.nodeValue = td[e.nodeValue];
    }
    else if(e.getAttribute && e.getAttribute("value") && td[e.getAttribute("value")]) {
        e.setAttribute("value", td[e.getAttribute("value")]);
        e.addEventListener("click", function(){
            Translate(document.getElementById("RESConfigPanelOptions"), td);
        }, false);
    }

    if(e.hasChildNodes) Translate(e.childNodes[0], td);
    Translate(e.nextSibling, td);
}

function TranslateDescriptionByRegExp(regexp, replacetext) {
    var arrayElements = document.getElementsByClassName("optionDescription");
    for(var i = 0; i < arrayElements.length; i++) {
        var e = arrayElements[i];
        if(("" + e.innerHTML).match(regexp)){
            e.innerHTML = ("" + e.innerHTML).replace(regexp, replacetext);
        }
    }
}

function TranslateData(arrayData){
    var td = [];
    
    if(arrayData.length % 2 === 1){
        arrayData.push("");
    }

    var count = 0;
    while(arrayData.length > 0){
        var l = arrayData.shift();
        var r = arrayData.shift();
        if(!td[l] && td[l] !== ""){
            if(!resja_debug) {
                td[l] = r;
            }
            else {
                td[l] = "" + (count+1) + ":" + r;
            }
        }
        count++;
    }
    td.count = count;
    
    return td;
}

function AddDescription(id, text) {
    var targetparent = document.getElementById(id);
    for(var i = 0; i < targetparent.children.length; i++) {
        var target = targetparent.children[i];
        var c = target.getAttribute("class").split(" ");
        for(var j = 0; j < c.length; j++){
            if(c[j] === "optionDescription") {
                target.innerHTML = text;
            }
        }
    }
}

function ClickActiveModule() {
    var arrayTarget = document.getElementsByClassName("moduleButton");
    for(var i = 0; i < arrayTarget.length; i++) {
        var target = arrayTarget[i];
        var c = target.getAttribute("class").split(" ");
        for(var j = 0; j < c.length; j++){
            if(c[j] === "active") {
                target.click();
            }
        }
    }
    
}

function TranslateSettings(){
    if(document.getElementById("RESConfigPanelModulesPane")){
        if(document.getElementById("RESConfigPanelModulesPane").getAttribute("translated_ja") === "true") return;
    }
    
    TranslateCategory("About RES",    "RESについて"    );
    TranslateCategory("My account",   "マイアカウント");
    TranslateCategory("Users",        "ユーザー"       );
    TranslateCategory("Comments",     "コメント"       );
    TranslateCategory("Submissions",  "サブミッション" );
    TranslateCategory("Subreddits",   "サブレディット" );
    TranslateCategory("Appearance",   "見た目"         );
    TranslateCategory("Browsing",     "ブラウジング"   );
    TranslateCategory("Productivity", "生産性"         );
    TranslateCategory("Core",         "コア"           );
    
    Translate(document.getElementById("RESAllOptions"), TranslateData(["Show advanced options", "上級者向け設定を表示する"]));
    Translate(document.getElementById("noOptions"), TranslateData(["\n							There are no configurable options for this module.\n						", "この機能に他の設定はありません。"]));

    TranslateModule(
        "contribute", "寄付と貢献", TranslateData([
            "RES is entirely free - as in beer, as in open source, as in everything.  If you like our work, a contribution would be greatly appreciated.",
            "RESは完全に無料です － すべての場合のように、オープンソースの場合のように、ビールの場合のように。もし気に入っていただけたのなら、寄付をお願いいたします。",
            "When you contribute, you make it possible for the team to cover hosting costs and other expenses so that we can focus on doing what we do best: making your Reddit experience even better.",
            "あなたの寄付は開発チームの維持・運営に役立てられます。そうすれば、私たちは最高の結果を出すことができるので、あなたのReddit経験をさらによくすることができます。",
            "Fee-free donation methods:",
            "手数料がかからない寄付方法：",
            "Donation methods we pay a fee on:",
            "手数料がかかる寄付方法：",
            "PayPal (least preferred, charges fees)",
            "PayPal （手数料がかかるので、最も好まれません）",
        ])
    );
    TranslateModule(
        "search", "RESの設定項目の検索", TranslateData([
            "You can search for RES options by module name, option name, and description. For example, try searching for \"daily trick\" in one of the following ways:",
            "RESの設定項目をモジュール名・オプション名・説明文から検索できます。例えば「daily trick」を探す場合は次の方法のいずれかが使用できます：",
            "type <code>daily trick</code> in the search box to the left and click the magnifying glass button",
            "左にある検索ボックスに daily trick と入力して虫眼鏡ボタンを押します。",
            "press <code>.</code> to open the RES console, type in <code>search <em>daily trick</em></code>, and press Enter",
            "キーボードの . を押してRESコンソールを開き、search daily trick と入力してEnterキーを押します。",
        ])
    );
    TranslateModule(
        "submitIssue", "問題を報告", TranslateData([
            "If you have any problems with RES, visit <a href=\"/r/RESissues\">/r/RESissues</a>. If you have any requests or questions, visit <a href=\"/r/Enhancement\">/r/Enhancement</a>.",
            "RESの問題を見つけたら <a href=\"/r/RESissues\">/r/RESissues</a> （英語）を訪れてください。要望や質問があれば <a href=\"/r/Enhancement\">/r/Enhancement</a>（英語） を訪れてください。<br>※RESの翻訳は非公式なものですので、上記のサブミッションには書き込まないでください。<br><br>RESの日本語化や、RESに関する情報交換を日本語でやり取りをしたい方は <a href=\"/r/Enhancement_ja\">/r/Enhancement_ja</a> を訪れてください。",
        ])
    );
    TranslateModule(
        "troubleshooter", "トラブルシューター", TranslateData([
            "Resolve common problems and clean/clear unwanted settings data.<br><br>Your first line of defence against browser crashes/updates, or potential issues with RES, is a frequent backup.<br><br>See <a href=\"/r/Enhancement/wiki/where_is_res_data_stored\">here</a> for the location of the RES settings file for your browser/OS.",
            "よくある問題の解決と、必要ない設定データを削除できます。<br><br>ブラウザのクラッシュや更新、RESの問題から設定を守るにはこまめにバックアップを行ってください。<br><br>設定の保存場所を知るには <a href=\"/r/Enhancement/wiki/where_is_res_data_stored\">ここ</a> を見てください。（※現在のバージョンでは、<a id=\"resja_1\" href=\"#!settings/backupAndRestore\">RESの設定画面からもバックアップと復元ができます</a>。）",
            "Reset the <code>userInfo</code> cache for the currently logged in user. Useful for when link/comment karma appears to have frozen.",
            "ログイン中のユーザーの<code>ユーザー情報キャッシュ</code>をリセットします。リンク・コメントカルマ表示が変わらなくなってしまった場合に使えます。",
            "Reset the 'My Subreddits' dropdown contents in the event of old/duplicate/missing entries.",
            "My Subredditsのドロップダウンに 古い/ダブっている/見つからない 項目がある場合はこのボタンを押してリセットしてください。",
            "Remove all entries for users with between +1 and -1 vote tallies (only non-tagged users).",
            "+1から-1までの投票集計を持つユーザーの情報を削除します。（タグを付けていないユーザーのみ）",
            "Warning: This will remove all your RES settings, including tags, saved comments, filters etc!",
            "警告：このボタンを押すとタグ・保存したコメント・フィルターなどを含む全てのRESの設定が削除されます！",
            "Reloads the page and disables RES for this tab <i>only</i>. RES will still be enabled 				in any other reddit tabs or windows you currently have open or open after this. This feature can be 				used for troubleshooting, as well as to quickly hide usernotes, vote counts, subreddit shortcuts, 				and other RES data for clean screenshotting.",
            "<i>「このタブで」</i>RESを無効にします。すでに開いている他のタブや、この操作の後に開いた別のタブではRESが有効です。この機能はトラブルシューティングの他に、ユーザーノート・投票カウント・サブレディットショートカット・その他のRESによる表示を隠してスクリーンショットを撮るためにも使うことができます。",
            "Pause JavaScript execution to allow debugging",
            "JavaScriptの実行を一時停止します。（デバッグ用）",
            "Test rendering templates",
            "テンプレートを表示するテスト。",
            "Clear",
            "消去",
            "Reset",
            "リセット",
            "Disable",
            "無効化",
            "Pause JavaScript",
            "JavaScriptを一時停止",
            "Test templates",
            "テンプレートをテスト",
        ]),
        function() {
            document.getElementById("resja_1").addEventListener("click", function() {
                setTimeout(function() {
                    ClickActiveModule();
                }, 100);
            }, false);
        }
    );
    TranslateModule(
        "about", "RESについて", TranslateData([
            "<a target=\"_blank\" href=\"http://www.honestbleeps.com/\">Steve Sobel</a> (<a target=\"_blank\" href=\"http://www.reddit.com/user/honestbleeps/\">/u/honestbleeps</a>) is the primary developer of RES.  Beyond that, there are a number of people who have contributed code, design and/or great ideas to RES.  <a target=\"_blank\" href=\"/r/Enhancement/w/about/team\">Read more about the RES team.</a>",
            "<a target=\"_blank\" href=\"http://www.honestbleeps.com/\">Steve Sobel</a> (<a target=\"_blank\" href=\"http://www.reddit.com/user/honestbleeps/\">/u/honestbleeps</a>) がRESの主要な開発者です。また、たくさんの人がコード・デザイン・素晴らしいアイディアでRESに貢献してくれました。<a target=\"_blank\" href=\"/r/Enhancement/w/about/team\">RES開発チームについてはここを見てください</a>。",
            "Reddit Enhancement Suite is a collection of modules that makes browsing reddit a whole lot easier.",
            "Reddit Enhancement Suiteはredditを簡単に見られるようにする機能の集まりです。",
            "Read more about what RES can do for you on the <a href=\"http://www.reddit.com/r/Enhancement/wiki\">/r/Enhancement wiki</a> or look over the <a href=\"http://www.reddit.com/r/Enhancement/faq\">Frequently Asked Questions</a>.",
            "RESができることについては <a href=\"http://www.reddit.com/r/Enhancement/wiki\">/r/Enhancement wiki</a> または <a href=\"http://www.reddit.com/r/Enhancement/faq\">よくある質問</a> を見てください。",
            "If something looks broken, <a href=\"http://www.reddit.com/r/RESissues/search?restrict_sr=on\">search in /r/RESissues</a> or <a href=\"http://www.reddit.com/r/RESIssues/submit\">post a bug report</a>.",
            "何かおかしい所があったら <a href=\"http://www.reddit.com/r/RESissues/search?restrict_sr=on\">/r/RESissues を検索（英語）</a> するか <a href=\"http://www.reddit.com/r/RESIssues/submit\">バグを報告（英語）</a> してください。",
            "If you have an idea or want to chat with other RES users, <a href=\"http://www.reddit.com/r/Enhancement/search?restrict_sr=on\">search in /r/Enhancement</a> or <a href=\"http://www.reddit.com/r/Enhancement/submit\">submit a feature request or discussion</a>.",
            "何か考えがあったり、他のRESユーザーとチャットがしたいなら <a href=\"http://www.reddit.com/r/Enhancement/search?restrict_sr=on\">/r/Enhancement を検索</a> または <a href=\"http://www.reddit.com/r/Enhancement/submit\">要望や話し合いをしてください</a>。",            
            "If you'd like to contribute code to RES, check out <a href=\"https://github.com/honestbleeps/Reddit-Enhancement-Suite\" target=\"_blank\">RES on GitHub</a>.",
            "RESにコードを提供したい場合は <a href=\"https://github.com/honestbleeps/Reddit-Enhancement-Suite\" target=\"_blank\">GitHubで公開中のRES</a> を見てください。",
            "License: Reddit Enhancement Suite is released under the <a target=\"_blank\" href=\"http://www.gnu.org/licenses/gpl-3.0.html\">GPL v3.0</a>.",
            "ライセンス：Reddit Enhancement Suite は <a target=\"_blank\" href=\"http://www.gnu.org/licenses/gpl-3.0.html\">GPL v3.0</a> の下で公開されます。",
            "<strong>Note:</strong> Reddit Enhancement Suite will check, at most once a day, to see if a new version is available.  No data about you is sent to me nor is it stored.",
            "<strong>注意：</strong>Reddit Enhancement Suite は一日に一回、最新バージョンがあるか確認します。個人情報を送信したり保存されることはありません。",
        ])
    );
    TranslateModule(
        "RESTips", "RESの便利な使い方", TranslateData([
            "Adds tips/tricks help to RES console",
            "RESの便利な使い方を表示します。",
            "Show a random tip once every 24 hours.",
            "RESの便利な使い方を24時間ごとに表示する。",
        ])
    );
    TranslateModule(
        "accountSwitcher", "アカウント切り替え", TranslateData([
            "Store username/password pairs and switch accounts instantly while browsing Reddit!\n\n<br><br>If you forget a password which is stored in Account Switcher, <a href=\"/r/Enhancement/wiki/faq/passwords\">you can recover them from RES settings</a>. Be aware that RES offers very little protection for stored passwords, so be careful when sharing your computer or settings!",
            "ユーザー名(ID)とパスワードの組み合わせを保存しておき、アカウントをすぐに切り替えることができます。<br><br>もしパスワードを忘れてしまっても、ここで保存したパスワードなら <a href=\"/r/Enhancement/wiki/faq/passwords\">RES設定から復元</a>（英語） することができます。しかしRESのパスワード保護は最低限なので、PCや設定を共有するときはパスワードを盗まれないように注意してください。",
            "Keep me logged in when I restart my browser.",
            "ブラウザを再起動してもログイン状態を維持する。",
            "Set your usernames and passwords below. They are only stored in RES preferences.",
            "[+add account]ボタンを押してユーザー名とパスワードを登録してください。これらはRESの設定としてのみ保存されます。",
            "username",
            "ユーザー名",
            "password",
            "パスワード",
            "After switching accounts, show a warning in other tabs.",
            "アカウントを切り替えた場合、他のタブに警告を表示する。",
            "After switching accounts, automatically reload other tabs.",
            "アカウントを切り替えた場合、他のタブを自動的にリロードする。",
            "Show my current user name in the Account Switcher.",
            "現在のユーザー名をアカウント切り替えボタンの隣に表示する。",
            "snoo (alien) ",
            "snooアイコン",
            "simple arrow ",
            "矢印",
            "Use the \"snoo\" icon, or older style dropdown?",
            "ドロップダウンスタイルを選択する。snooは画面左上のキャラクターです。",
            "Show details of each account in the Account Switcher, such as karma or gold status.",
            "アカウント切り替え機能で、詳細情報を表示する（表示するものは下で選択）。",
            "Show the link and comment karma of each account in the Account Switcher.",
            "アカウント切り替え機能で、リンクカルマとコメントカルマを表示する。",
            "Show the gold status of each account in the Account Switcher.",
            "アカウント切り替え機能で、reddit goldの状態を表示する。",
        ])
    );
    TranslateModule(
        "localDate", "ローカル日時", TranslateData([
            "Shows date in your local time zone when you hover over a relative date.",
            "書き込み時刻などにマウスオーバーしたとき、ローカル日時で表示します。",
        ])
    );
    TranslateModule(
        "messageMenu", "メッセージメニュー", TranslateData([
            "Navigate quickly to inboxes and other parts of the reddit messaging system",
            "受信箱やその他のredditメッセージシステムに素早く移動できます。（※下で設定した項目が、メールマークにマウスオーバーすることで表示されるようになります）",
            "label",
            "ラベル（表示名）",
            "url",
            "移動先URL",
            "Add Row",
            "項目を追加",
            "Use Quick Message pop-up when composing a new message",
            "新しいメッセージを作成するとき、クイックメッセージ（ポップアップ形式）を使用する。",
            "Delay, in milliseconds, before hover tooltip loads. Default is 800.",
            "メニューを開くまでの時間をミリ秒単位で指定。（初期値：800）",
            "Delay, in milliseconds, before hover tooltip fades away. Default is 200.",
            "メニューが消えるまでの時間をミリ秒単位で指定。（初期値：200）",
            "Fade animation's speed (in seconds). Default is 0.7.",
            "フェード時間を秒単位で指定。（初期値：0.7）",
        ])
    );
    TranslateModule(
        "quickMessage", "クイックメッセージ", TranslateData([
            "A pop-up dialog that allows you to send messages from anywhere on reddit. Messages can be sent from the quick message dialog by pressing control-enter or command-enter.",
            "redditのどこにいてもメッセージを送れるクイックメッセージ画面を表示できます。クイックメッセージ画面でCtrl-EnterまたはCommand-Enterを押すとメッセージを送信できます。",
            "Keyboard shortcut to open the quick message dialog.",
            "クイックメッセージ画面を表示するショートカットキー。",
            "Text that will automatically be inserted into the subject field, unless it is auto-filled by context.",
            "subject（件名）に設定する文字列。空白の場合は状況に応じて変わります。",
            "Current user ",
            "現在のユーザー ",
            "Current subreddit ",
            "現在のサブレディット ",
            "Last selected ",
            "最後に選択したもの ",
            "Last selected (this page load) ",
            "最後に選択したもの (このページ中で) ",
            "The default user or subreddit to select when the \"from\" field is unspecified.<p>Reverts to the current user if the selected option can't be used (i.e. you aren't a moderator of the current subreddit).</p>",
            "from（差出人）欄を空白にしたときに使用するデフォルト。選択した項目が使用できないとき（現在のサブレディットを選択したが、あなたがそこのモデレーターではない場合など）は「現在のユーザー」が使用されます。",
            "Open the quick message dialog when clicking on reddit.com/message/compose links in comments, selftext, or wiki pages.",
            "コメント・selftext（※詳細不明）・reddit内のwikiにある reddit.com/message/compose に移動するリンクをクリックしたとき、クイックメッセージ画面を開く。",
            "Open the quick message dialog when clicking on reddit.com/message/compose links in the sidebar. (e.g. \"message the moderators\")",
            "サイドバーにある reddit.com/message/compose に移動するリンクをクリックしたときクイックメッセージ画面を開く。（例えばモデレーター一覧の右上にある、\"message the moderators（モデレーターにメッセージを送る）\"など）",
            "Automatically start with a link to the current page in the message body (or, if opened from the user info popup, a link to the current post or comment).",
            "body（本文）の初期値を現在のページへのリンクにする。ユーザー情報ポップアップからクイックメッセージ画面に移動した場合はその投稿またはコメントへのリンクになります。",
        ])
    );
    TranslateModule(
        "showKarma", "カルマ表示", TranslateData([
            "Add more info and tweaks to the karma next to your username in the user menu bar.",
            "ユーザーメニューバーのユーザー名の隣に表示されるカルマをもっと詳しく表示・調整します。",
            "Show comment karma in addition to link karma",
            "リンクカルマに加えて、コメントカルマも表示します。",
            "Separator character between post/comment karma",
            "リンクカルマ・コメントカルマの間に表示する区切り文字。",
            "Use commas for large karma numbers",
            "カルマの値が大きいとき、コンマを付加します。",
        ])
    );
    TranslateModule(
        "orangered", "未読メッセージ表示", TranslateData([
            "Helping you get your daily dose of orangereds",
            "Helping you get your daily dose of orangereds",
            "When clicking the mail envelope or modmail icon, open mail in a new tab?",
            "メールアイコンまたはモデレーターメールのアイコンをクリックしたとき、メール画面を新しいタブで開く。",
            "Update mail buttons on current tab when RES checks for orangereds",
            "未読状態を確認したとき、現在のタブのメールアイコンを更新する。",
            "Update all open tabs when RES checks for orangereds",
            "未読状態を確認したとき、全てのタブのメールアイコンを更新する。",
            "Show an envelope (inbox) icon in the top right corner",
            "メールアイコンを右上の隅に表示します。",
            "Show unread message count next to orangereds?",
            "未読通知アイコンの横に未読数を表示する。",
            "If you dislike the unread count provided by native reddit, you can replace it with the RES-style bracketed unread count",
            "reddit標準の未読数表示が気に入らない場合、RESスタイルの未読数表示に変更できます。",
            "Show unread message count in page/tab title?",
            "未読数をページ/タブのタイトルに表示する。",
            "Show unread message count in favicon?",
            "未読数をfavicon（ブラウザのタイトルやブックマークに表示されるアイコン）に表示します。",
            "Reset the favicon before leaving the page. \n\n This prevents the unread badge from appearing in bookmarks, but may hurt browser caching.",
            "ページを離れる前にfaviconをリセットします。これはブックマークのアイコンに未読数が表示されてしまうのを防ぎますが、ブラウザのキャッシュ処理に悪影響が出るかもしれません。",
            "Always go to the inbox, not unread messages, when clicking on orangered",
            "未読通知アイコンをクリックしたとき、未読メッセージ一覧ではなく受信箱に移動します。",
            "Hide the mod mail button in user bar.",
            "ユーザーバーにモデレーターメールのアイコンを表示しません。（※この設定は、自分がモデレーターをしているサブレディットでのみ意味があります）",
        ])
    );
    TranslateModule(
        "userbarHider", "ユーザーバー非表示", TranslateData([
            "Hide the user bar (username, karma, preferences, etc.) in the top right corner. <br> Previously part of Style Tweaks",
            "画面右上のユーザーバー（ユーザー名・カルマ・個人設定などを表示）を隠す。以前はスタイル調整機能の一部でした。",
            "Visible ",
            "表示",
            "Hidden ",
            "非表示",
            "Is the userbar visible?",
            "ユーザーバーを表示するかどうか。",
            "Is the button to toggle the userbar visible? Only applies when the user bar is visible",
            "ユーザーバーの表示切替ボタンを表示するかどうか。ユーザーバーを表示する場合のみ有効。",
        ])
    );
    TranslateModule(
        "usernameHider"       , "ユーザー名非表示", TranslateData([
            "Username hider hides your username from displaying on your screen when you're logged in to reddit. 	This way, if someone looks over your shoulder at work, or if you take a screenshot, your reddit username is not shown. 	This only affects your screen. There is no way to post or comment on reddit without your post being linked to the account 	you made it from.",
            "ユーザー名非表示機能はredditにログインしているときのあなたのユーザー名表示をダミーに置き換えることで隠します。これにより誰かがあなたの画面を覗き見したり、あなたが撮ったスクリーンショットでredditのユーザー名を知られなくて済みます。この設定はあなたの画面にのみ有効です。匿名での書き込みが出来るようになるわけではありません。",
            "What to replace your username with. Default is ~anonymous~.",
            "ダミーの名前を指定します。（標準値：~anonymous~）",
            "Allows you to specify the display text for a specific account. (useful in conjunction with the Account Switcher!)",
            "アカウント（ユーザー名）ごとにダミーの名前を設定できます。（アカウント切り替え機能と組み合わせて使うと便利です！）",
            "username",
            "ユーザー名",
            "displayText",
            "ダミーの表示名",
            "Hide all accounts listed in perAccountDisplayText, not just the logged-in user.",
            "ログインしているアカウントだけでなく、perAccountDisplayTextに設定したアカウントのユーザー名を全てをダミーに置き換える。",
            "Hide all accounts listed in Account Switcher. <br> 			If an username isn't already listed in perAccountDisplayText, then hide that username with the default displayText.",
            "アカウント切り替え機能で登録したアカウントのユーザー名を全て隠す。<br>ダミー名がperAccountDisplayTextで個別に設定されていない場合は、displayTextの設定を使用する。",
            "Mousing over the text hiding your username reveals your real username.<br>			This makes it easy to double check that you're commenting/posting from the correct account,			while still keeping your username hidden from prying eyes.",
            "あなたのダミー名にマウスオーバーしたときに本当のユーザー名を表示する。<br>誤爆防止などの目的で名前を確認しやすくなりますが、他人に見られないように注意しましょう。",
        ])
    );
    TranslateModule(
        "userHighlight", "ユーザーハイライト", TranslateData([
            "Highlights certain users in comment threads: OP, Admin, Friends, Mod - contributed by MrDerk",
            "コメントスレッドの中でOP（サブミッションを投稿した人）、管理者、フレンド、モデレーターなどを強調表示する。MrDerk氏の貢献による。（CSSで強制名無し表示を行っているサブレディットでは強調表示が効きません。）",
            "Highlight OP's comments",
            "OPのコメントを強調表示する。",
            "Color to use to highlight OP. Defaults to original text color",
            "OPを強調するための色。",
            "Color used to highlight OP on hover.",
            "マウスオーバー時にOPを強調するための色。",
            "Highlight Admin's comments",
            "管理者のコメントを強調表示する。",
            "Color to use to highlight Admins. Defaults to original text color",
            "管理者を強調するための色。",
            "Color used to highlight Admins on hover.",
            "マウスオーバー時に管理者を強調するための色。",
            "Highlight Friends' comments",
            "フレンドのコメントを強調表示する。",
            "Color to use to highlight Friends. Defaults to original text color",
            "フレンドを強調するための色。",
            "Color used to highlight Friends on hover.",
            "マウスオーバー時にフレンドを強調するための色。",
            "Highlight Mod's comments",
            "モデレーターのコメントを強調表示する。",
            "Color to use to highlight Mods. Defaults to original text color",
            "モデレーターを強調するための色。",
            "Color used to highlight Mods on hover. Defaults to gray.",
            "マウスオーバー時にモデレーターを強調するための色。",
            "Highlight the person who has the first comment in a tree, within that tree",
            "コメントツリーの中で最初のコメントをした人を強調表示する。（同ツリー中で2回以上コメントしていないと強調されない）",
            "Don't highlight the \"first commenter\" on the first comment in a tree",
            "コメントツリーの中で最初のコメントをした人を強調表示するが、最初のコメントは強調しない。",
            "Color to use to highlight the first-commenter. Defaults to original text color",
            "コメントツリーの中で最初のコメントをした人を強調するための色。",
            "Color used to highlight the first-commenter on hover.",
            "マウスオーバー時にコメントツリーの中で最初のコメントをした人を強調するための色。",
            "Color for highlighted text.",
            "強調されたテキストの色。",
            "Automatically set a special color for each username",
            "各ユーザー名に自動で特別な色を付ける。",
            "Random color, not too bright, consistent for each user; night mode-friendly ",
            "ランダムで明るすぎない色を選ぶ。ナイトモード対応。 ",
            "Simple random color, consistent for each user. (original) ",
            "ランダムな色。 ",
            "All black or, in night mode, all light gray ",
            "全て黒色（ナイトモードでは灰色） ",
            "Select a method for setting colors for usernames",
            "ユーザー名の色をどのように決めるか選択。",
            "Automatically generate hover color based on normal color.",
            "各項目ごとに通常の色を元にマウスオーバー時の色を生成。",
        ])
    );
    TranslateModule(
        "userInfo", "ユーザー情報", TranslateData([
            "Adds a hover tooltip to users",
            "ユーザー名にマウスオーバーしたときに情報を表示します。",
            "Show information on user (karma, how long they've been a redditor) on hover.",
            "ユーザー名にマウスオーバーした時に情報（カルマ、ID登録からの経過日数）を表示する。",
            "Open the quick message dialog when clicking on the \"send message\" button in hover info, instead of going straight to reddit's message page.",
            "ユーザー情報ポップアップの\"send message\"ボタンを押した時にredditのメッセージページではなくクイックメッセージ入力ボックスを開く。",
            "Delay, in milliseconds, before hover tooltip loads. Default is 800.",     
            "マウスオーバー時に情報を読み込むまでの待ち時間をミリ秒単位で指定。（初期値：800）",
            "Delay, in milliseconds, before hover tooltip fades away. Default is 200.", 
            "マウスカーソルが離れてからツールチップが消えるまでの待ち時間をミリ秒単位で指定。（初期値：200）",
            "Fade animation's speed (in seconds). Default is 0.7.",
            "フェード時間を秒単位で指定。（初期値：0.7）",
            "When clicking the \"give gold\" button on the user hover info on a comment, give gold to the comment.", 
            "コメントのユーザー情報ポップアップでgivegoldをクリックしたとき、ユーザーではなくそのコメントに対してgoldを送る。",
            "Show \"highlight\" button in user hover info, for distinguishing posts/comments from particular users.",  
            "ユーザー情報ポップアップに\"highlight\"ボタンを表示する。",
            "Color used to highlight a selected user, when \"highlighted\" from hover info.",    
            "ユーザー情報ポップアップの\"highlight\"ボタンを押した場合にそのユーザーを強調するための色。",
            "Color used to highlight a selected user on hover.",     
            "上記の色で強調されたユーザー名にマウスオーバーした時の色。",
            "Show date (redditor since...) in US format (i.e. 08-31-2010)",  
            "ID登録日をUSフォーマット（月-日-年）で表示する",
        ])
    );
    TranslateModule(
        "userTagger", "ユーザータグ", TranslateData([
            "Adds a great deal of customization around users - tagging them, ignoring them, and more. You can manage tagged users on <a href=\"/r/Dashboard/#userTaggerContents\">Manage User Tags</a>.", 
            "<a href=\"/r/Dashboard/#userTaggerContents\">ユーザータグの設定</a> でユーザーに関する強力なカスタマイズ（タグ付与、無視、その他）を提供します。",
            "When \"hard ignore\" is off, only post titles and comment text is hidden. When it is on, the entire post is hidden (or for comments, collapsed).", 
            "offの場合はサブミッションのタイトルとコメントが隠されますが、「show anyway?（それでも表示する）」リンクをクリックすれば見ることができます。onにすると無視しているユーザーが投稿したサブミッションは完全に見えなくなり、コメントは非表示にしたうえで折り畳まれます。",
            "Color users based on cumulative upvotes / downvotes",    
            "upvoteとdownvoteの累積値をもとにユーザーに色を付ける。",
            "By default, store a link to the link/comment you tagged a user on",  
            "onの場合、ユーザーにタグを付けるときLink欄に初期値を設定する。offであればLink欄は空欄となる。（Linkを設定した場合はユーザー情報ポップアップからアクセスできる）",
            "By default, store a link to the comments when tagging a user in a link post. Otherwise, the link (that the post refers to) will be used.",  
            "onの場合、Link欄の初期値をタグを付けようとしているユーザーのコメントへのURLにする。offの場合、対象がサブミッションの投稿者であれば初期値をソースへのURLにする。",
            "Show the number (i.e. [+6]) rather than [vw]",     
            "onの場合はタグの後ろにVote Weightの値（タグを付けるときに設定可能で0の場合は非表示）を表示する。offの場合は[vw]と表示する。",
            "Show the vote weight tooltip on hover (i.e. \"your votes for...\")",   
            "タグの後ろに表示されるvote weightにマウスオーバーした時ツールチップで表示する。",
        ])
    );
    TranslateModule(
        "commentHidePersistor", "コメント非表示の保持", TranslateData([
            "Saves the state of hidden comments across page views.",
            "ページを移動してもコメントの非表示状態を保持できます。（[-]ボタンを押して折り畳んだ状態を記憶しておく）",
        ])
    );
    TranslateModule(
        "commentNavigator", "コメントナビゲーター", TranslateData([  
            "Provides a comment navigation tool to easily find comments by OP, mod, etc.", 
            "OP（サブミッション作成者の投稿）やモデレーターなどを見つけやすくします。",
            "Display Comment Navigator by default",       
            "コメントナビゲーターをデフォルトで表示する。",
            "Display Comment Navigator when a user is highlighted",      
            "ユーザーが強調表示された時にコメントナビゲーターを表示する。",
        ])
    );
    TranslateModule(
        "context", "コンテキスト", TranslateData([
            "Adds a link to the yellow infobar to view deeply linked comments in their full context.",
            "黄色い情報バー（リンク先が個別の投稿だった時、対象の背景が黄色くなる）にリンクを追加し、他のコメントを見られるようにします。",
            "Add a \"View the Full Context\" link when on a comment link",    
            "\"View the Full Context\"（そのコメントを含むスレッドを全て表示する）リンクを追加する。",
            "Change the default context value on context link",    
            "コンテキストリンクのデフォルト値を変更できます。（この値の分だけ親コメントをさかのぼって表示する）",
        ])
    );
    TranslateModule(
        "commentTools", "コメントツール", TranslateData([ 
            "Provides tools and shortcuts for composing comments, text posts, wiki pages, and other markdown text areas.",
            "コメント・投稿・wikiページを作成するためのツールとショートカットを提供します。",
            "Show user autocomplete tool when typing in posts, comments and replies",     
            "投稿・コメント・返信を書くときに、ユーザー(/u/username)の入力候補を表示する。",
            "Show subreddit autocomplete tool when typing in posts, comments and replies",  
            "投稿・コメント・返信を書くときに、サブレディット(/r/subreddit)の入力候補を表示する。",
            "Show formatting tools (bold, italic, tables, etc.) to the edit form for posts, comments, and other snudown/markdown areas.",    
            "整形ツール（太字・斜体・表など）のボタンを表示する。",
            "Use keyboard shortcuts to apply styles to selected text",   
            "キーボードショートカットで選択したスタイルを整形できるようにする。",
            "Keyboard shortcut to make text bold.",
            "キーボードショートカット：太字",
            "Keyboard shortcut to make text italic.",
            "キーボードショートカット：斜体",
            "Keyboard shortcut to add a strikethrough.",
            "キーボードショートカット：打ち消し線",
            "Keyboard shortcut to make text superscript.",
            "キーボードショートカット：上付き",
            "Keyboard shortcut to add a link.",
            "キーボードショートカット：リンク",
            "Keyboard shortcut to quote text.",
            "キーボードショートカット：引用",
            "Pressing Ctrl+Enter or Cmd+Enter will submit your comment/wiki edit.",   
            "Ctrl+EnterかCmd+Enterでコメント/wikiの編集を送信する。",
            "Pressing Ctrl+Enter or Cmd+Enter will submit your post.",   
            "Ctrl+EnterかCmd+Enterでサブミッションを投稿する。",
            "Shows your currently logged in username to avoid posting from the wrong account.",   
            "ログイン中のユーザー名をコメントの入力ボックスの上に表示（Commenting As: ユーザー名）し、誤爆防止に役立てる。",
            'Put in bold the "Commenting As" part if you are using an alt account. The first account in the Account Switcher module is considered as your main account.',  
            "サブアカウントを使用している場合、Commenting Asを太字で表示する。アカウント切り替え機能で一番上に登録したものがメインアカウントとなり、それ以外はサブアカウントとなります。",
            "When submitting, display the number of characters entered in the title and text fields and indicate when you go over the 300 character limit for titles.",  
            "投稿時に入力済文字数と文字数制限を表示する。",
            "Add macro buttons to the edit form for posts, comments, and other snudown/markdown text areas.",
            "投稿画面にマクロボタン（事前に登録した文を簡単入力できるボタン）を表示する。",
            "Add buttons to insert frequently used snippets of text.",    
            "よく使う文をマクロとして登録できます。",
            "After selecting a macro from the dropdown list, do not hide the list.",   
            "マクロを選択した後、リストを閉じないようにする。",
            "When using macro, replace placeholders in text via pop-up prompt.			",    
            "マクロを使用するとき、プレースホルダー（{{hensuu}}のように適当な変数名を中括弧で括ったもの）をポップアップで入力したものに置き換える。",
            "Example macro text:",        "プレースホルダーを使用したマクロの例：",
            "			The {{adj1}} {{adj2}} {{animal}} jumped over the lazy {{dog_color}} dog. The {{animal}} is so {{adj1}}!			",   
            "すごい{{nanika}}を感じる。今までにない何か熱い{{nanika}}を。（中略）{{jama1}}や{{jama2}}は入るだろうけど、絶対に流されるなよ。",
            "Some placeholders are automatically filled in when you use the macro:",      
            "いくつかのプレースホルダーは自動的に置き換えられます。",
            "The current subreddit, in the form /r/subreddit",      
            "現在のサブレディット。/r/subredditの形になります。",
            "Your username, in the form /u/username",       
            "あなたのユーザー名。/u/usernameの形になります。",
            'The username of the "original poster", in the form /u/username. On a post'+"'s comments page, this the person who made the post; on a PM / modmail, this is the person who started the conversation",  
            "OP（投稿の場合はサブミッションを立てた人、プライベートメッセージの場合は会話を始めた人）を/r/usernameの形で表示します。",
            "The current page's URL, like http://www.reddit.com/r/Enhancement/comments/123abc/example_post",      
            "現在のページのURL。http://www.reddit.com/r/Enhancement/comments/123abc/example_post のように表示されます。",
            "The username of person you're replying to, in the form /u/username. ",  
            "あなたが返信しようとしている相手のユーザー名。/u/usernameの形になります。",
            "The text which is currently selected (highlighted)",     
            "現在選択中のテキスト。",
            "The current date and time in your locale",   
            "あなたの地域における日付と時刻。",
            "The current date in your locale",     
            "あなたの地域における日付。",
            "The selected text, escaped for snudown/markdown. Useful for text emoji like ¯\\_(ツ)_/¯",  
            "現在選択中のテキスト。snudown/markdown用のエスケープ（*などの機能を持つ文字をそのまま表示するように加工）するのでAAを使用する場合に便利です。",
            "Show the comment tools on the ban note textbox.",    
            "ban noteの入力画面でコメントツールを表示する。",
        ])
    );
    TranslateModule(
        "hideChildComments", "子コメントを隠す", TranslateData([      
            "Allows you to hide all comments except for replies to the OP for easier reading.",  
            "子コメント（他の人のコメントに返信したコメント）を全て非表示にできるようにします。",
            "Automatically hide all but parent comments, or provide a link to hide them all?",     
            "親コメント以外を自動的に隠す。",
        ])
    );
    TranslateModule(
        "commentPreview", "書き込みプレビュー", TranslateData([
            "Provides a live preview while editing comments, text submissions, messages, wiki pages, and other markdown text areas; as well as a two column editor for writing walls of text.",  
            "コメント・テキスト・wiki編集のプレビューおよび長文編集用の2カラムエディタを有効にする。",
            "Enable the 2 column editor.",   
            "2カラムエディタを有効にする。（入力ボックスの右下にbig editorボタンが追加される）",
            "Open the current markdown field in the big editor. (Only when a markdown form is focused)",  
            "big editorを開く。（コメント編集中のみ）",
            "Apply a 'draft' style  background to the preview to differentiate it from the comment textarea.",  
            "区別のためにコメントのプレビューの背景を薄い縞模様にする。",
            "Show preview for comments",   
            "コメントを入力する時にプレビューを表示する。",
            "Show preview for posts",    
            "サブミッションを投稿する時にプレビューを表示する。",
            "Show preview for wiki pages",     
            "wikiを編集する時にプレビューを表示する。",
            "Show preview for editing subreddit settings",   
            "サブレディットを設定する時にプレビューを表示する。",
            "Show preview for ban notes",   
            "ban noteのプレビューを表示する。",
            "Show the markdown live preview directly in the sidebar when editing",
            "サイドバーを編集するとき、サイドバーに直接書き込みプレビューを表示する。",            
        ])
    );
    TranslateModule(
        "noParticipation", "不参加", TranslateData([
            "Helps discourage brigading and helps you avoid getting banned, by warning against voting 		or commenting when following \"No Participation\" (np) links, and by providing options to prevent you from 		accidentally participating. 		",
            "No Participation(NP)リンクで移動した場合に投票またはコメントに関する警告を出します。（redditでは一時的に人を集めて投票を稼ぐことが禁止されているためリンクをするときにNPモードを使用することがあります。NPモードでは警告ポップアップが出たり投票矢印が見えなくなったりします。これはコメントや投票の前にワンクッション置いて、訪問先の雰囲気やルールを理解する機会を設けるためのものです。）",
            "Find out more about \"No Participation\".",   
            "No Participationについてはこちらを見てください。（未翻訳）",
            "Hide vote buttons. If you have already visited the page and voted, your prior votes will still be visible.", 
            "投票ボタンを隠す。もしすでに投票済みの場合はそのまま表示されます。",
            "Disable commenting.",   
            "コメントできなくする。",
            "Enable NP mode in subreddits where you're a subscriber",    
            "購読済みの場合でもNPモードを有効にする。",
            "Remove np mode when leaving a No-Participation page",     
            "No-Participationのページを離れた場合にNPモードを解除する。",
        ])
    );
    TranslateModule(
        "saveComments", "コメント保存", TranslateData([  
            "	You can save comments with RES: click the <em>save-RES</em> button below the comment. You can view 	these comments on your user page under the \"saved - RES\" tab (reddit.com/user/MyUsername/saved#comments). 	If you use <a class=\"\" href=\"#!settings/keyboardNav\">Keyboard Navigation</a>, you can press . 	to open the RES command line, then type in <code>me/sc</code> to see saved-RES comments. 	<br><br>	Saving with RES saves a comment locally in your browser. This means that you can see the comment you saved 	<i>as it looked when you saved it</i>, even if it is later edited or deleted. 	You can save comments with RES if you are not logged in, or if you are logged in to any account—all the 	comments will be visible in one location. You will only be able to view saved RES comments on whichever browser	you have RES istalled on.	<br><br>		When saving comments with reddit, you must be logged into an account; the comment is saved specifically for that account;	it won't be shown if you switch to a different account or log out. You can view these comments whenever you are logged into	the reddit account you saved them from, including on other browsers or devices.  	<br><br>		Visually, saving comments with reddit looks the same as saving with RES—but the text is not saved locally,	so the saved comment text shows the <i>current</i> state of the comment. If the comment has been edited or deleted 	since you saved it, the text that displays on your account's \"saved\" page will look different then it looked when you saved it.	<br><br>		If you have <a href=\"/gold/about\">reddit gold</a> on an account, you can add a category/tag to comments you have saved 	with reddit, then filter saved comments/posts by category. (You cannot sort or filter comments saved with RES.) 	",
            //"RESを使ってコメントを保存することができます：コメントの下にある <em>save-RES</em> ボタンをクリックしてください。保存したコメントはユーザーページの\"saved - RES\"タブ(reddit.com/user/MyUsername/saved#comments)で見ることができます。 <a class=\"\" href=\"#!settings/keyboardNav\">キーボード操作</a> が有効なら . （ドット）を押してコマンドラインを出した後に <code>me/sc</code> と入力することでアクセスできます。<br><br>RESを使って保存したコメントはブラウザに保存されます。つまり保存したコメントは、後で編集や削除されたとしても、保存したときの状態で診ることができます。RESでの保存はログインしていなくても、またどんなアカウントでログインしていても全てのコメントが一ヶ所で閲覧できます。RESで保存したコメントを見るには、保存時と同じPC・同じブラウザである必要があります。<br><br>redditの機能でコメントを保存するときは、アカウントに保存されるのでログインしておく必要があります。サーバー側に保存されるので他のデバイスやブラウザでもコメントを保存したユーザーでログインすれば読むことができます。コメントを保存したときとは別のアカウントでログインしたり、ログアウトした場合には見ることができません。コメントが編集されたり削除された場合は、保存したコメントもその影響を受けます。（コメントの内容ではなく、リンクを保存していると考えてください）アカウントを持っている場合は、そのアカウントで保存したコメントにカテゴリ・タグを追加することができ、それを利用してフィルタすることができます。（RESを使って保存したコメントではできません）",
            "RESを使ってコメントを保存することができます。コメントの下にある<em>save-RES</em>ボタンをクリックすると保存され、\"saved - RES\"タブ(reddit.com/user/MyUsername/saved#comments)で見ることができます。<a class=\"\" href=\"#!settings/keyboardNav\">キーボード操作</a>が有効であれば場合は . （ドット）を押してコマンドラインを出した後 <code>me/sc</code> と入力することでも見ることができます。<br><br>RESを使って保存したコメントはブラウザに保存されるので保存時の環境（同じPC、同じブラウザ、RESがインストール済）でなければ読めません。しかしコメントが編集されたり削除されても保存時の状態が維持され、redditにログインしていなくても保存したり読んだりできます。<br><br>redditの機能でコメントを保存するにはログインしておく必要があります。サーバー側に保存されるので他のデバイスやブラウザからでもコメントを保存したユーザーでログインすれば読むことができます。コメントが編集されたり削除された場合は、保存したコメントもその影響を受けます。（コメントの内容ではなく、リンクを保存していると考えてください）<br><br>reddit goldアカウントを持っている場合は、そのアカウントで保存したコメントにカテゴリ・タグを追加することができ、それを利用してフィルタすることができます。（RESを使って保存したコメントではできません）",
        ])
    );
    TranslateModule(
        "showParent", "親コメントポップアップ", TranslateData([  
            "Shows the parent comments when hovering over the \"parent\" link of a comment.", 
            "parent（親コメント）リンクにマウスオーバーした時に親コメントを表示する。",
            "Delay, in milliseconds, before parent hover loads. Default is 500.",    
            "マウスオーバーしてからポップアップするまでの待機時間をミリ秒単位で指定。（初期値：500）",
            "Delay, in milliseconds, before parent hover fades away after the mouse leaves. Default is 200.",  
            "マウスカーソルが離れてからポップアップが消えるまでの待機時間をミリ秒単位で指定。（初期値：200）",
            "Fade animation's speed (in seconds). Default is 0.7.",    
            "フェード時間を秒単位で指定。（初期値：0.7）",
            "Above ",   
            "上 ",
            "Below ",  
            "下 ",
            "Order the parent comments to place each parent comment above or below its children.",    
            "親コメントを子コメントのどちら側に表示するかを決める。",
        ])
    );
    TranslateModule(
        "sourceSnudown", "ソース表示", TranslateData([  
            "Add tool to show the original text on posts and comments, before reddit formats the text.",
            "各投稿とコメントの下に書き込み時のソースコードを表示するための「source」リンクを追加します。",
        ])
    );
    TranslateModule(
        "styleTweaks", "スタイル調整", TranslateData([
            "Provides a number of style tweaks to the Reddit interface. Also allow you to disable specific subreddit style (the <a href=\"/prefs/#show_stylesheets\">global setting</a> must be on).",   
            "redditのスタイル調整機能を提供します。また、特定のサブレディットスタイルを無効にできます。（<a href=\"/prefs/#show_stylesheets\">redditの個人設定</a> で「allow subreddits to show me custom themes」を有効にする必要があります。).",
            "Moves the username navbar to the top (great on netbooks!)",    
            "ユーザーバーをトップに移動する。",
            "Highlights comment boxes for easier reading / placefinding in large threads.", 
            "読みやすくするためにコメントボックスを強調する。",
            "Round corners of comment boxes",    
            "コメントボックスの角を丸くする。",
            "Highlight comment box hierarchy on hover (turn off for faster performance)",  
            "マウスオーバーしたコメントボックスを強調する。（offにすると処理速度が向上します）",
            "Indent comments by [x] pixels (only enter the number, no 'px')",     
            "コメントを指定したピクセル分インデントする。（単位を付けず、数字だけを入力してください）",
            "Show comment continuity lines",    
            "コメントの左側に点線を表示する。（子コメントに表示されます）",
            "Discourage CSS3 animations. (This will apply to all of reddit, every subreddit, and RES functionality. However, subreddits might still have some animations.)",     
            "CSS3のアニメーションをしない。（これはreddit全体やRESの機能に影響しますが、サブレディットでは効かないかもしれません）",
            "Reddit makes it so no links on comment pages appear as \"visited\" - including user profiles. This option undoes that.",  
            "コメントページまたはユーザープロフィールにあるリンクが既読の時に色が変わるようにする。（サブレディットのCSSによってはこの機能が効きません）",
            "Bring back video and text expando buttons for users with compressed link display",   
            "compressed link display（redditの設定）がonの時に、ビデオとテキストの展開ボタンを元に戻す。",
            "Hide vote arrows on threads where you cannot vote (e.g. archived due to age)",     
            "投票できないスレッドでは投票の矢印を表示しない。（例：古くなってアーカイブ状態になった書き込みなど）",
            "Never ",     
            "なし ",
            "On hover ",   
            "マウスオーバー時 ",
            "Always ",  
            "常時 ",
            "Choose when full link flair should be shown",    
            "いつ全リンクフレアーを表示すべきか選択する。",
            "Make edited timestamps bold (e.g. \"last edited 50 minutes ago\")", 
            "編集のタイムスタンプを太字で表示する（\"last edited 50 minutes ago\"などの表示）",
            "Use colorblind friendly styles when possible",     
            "色盲者用のスタイルが利用できるなら使う。",
            "Add an icon in the omnibar (where the page address is written) to disable/enable current subreddit style.",
            "ブラウザのアドレスバーにサブレディットスタイルをon/offできるアイコンを追加する。",
            "Scroll the standard subreddit dropdown (useful for pinned header and disabled Subreddit Manager)", 
            "基本的なサブレディットドロップダウンをスクロールする。",//（ヘッダを固定していてサブレディット管理が無効な場合に便利、とありますが変化が不明）
            "Draws a line to separate top-level comments for easier distinction.",   
            "トップレベルのコメントに線を引いて区別しやすくする。",
            "Specify the color to separate top-level comments",   
            "区切り線の色を設定する",
            "Specify how thick (in pixels) of a bar is used to separate top-level comments",  
            "線の太さをピクセル単位で指定する",
            "Makes the left sidebar (with multireddits) float as you scroll down so you can always see it.",   
            "左側のサイドバーを固定し、スクロールで移動しないようにする。",
            "do nothing ",
            "何もしない ",
            "Force a particular style of capitalization on post titles",
            "投稿タイトルで大文字・小文字の使用形式を強制する。それぞれの設定項目の見た目のとおり、順に「単語の先頭を大文字」「文章の先頭を大文字」「すべて小文字」にするという意味。",
        ])
    );
    TranslateModule(
        "filteReddit", "フィルター", TranslateData([
            "Filter out NSFW content, or links by keyword, domain (use User Tagger to ignore by user) or subreddit (for /r/all or /domain/*).",  
            "NSFW（Not Safe For Work：職場では不適切という意味でエロ・グロなどが該当）コンテンツや、設定したキーワード、ドメイン、サブレディットをフィルタします。（※redditの投稿一覧から見えなくなりますが、他の場所から移動することは防げません。）",
            "Filters all links labelled NSFW",    
            "NSFWとマークされたリンクをフィルタする。（※基本的に投稿者やモデレーターが設定するので、NSFWと感じる基準の違いや設定し忘れに注意）",
            "If more than this percentage (0-100) of a page is filtered, show a notification",      
            "1ページの中で指定した割合（％）を超える内容がフィルタ対象になった場合は通知を表示する。",
            "Add a quick NSFW on/off toggle to the gear menu",
            "歯車メニューにNSFWフィルタの切り替えボタンを表示する。",
            "When visiting the comments page for a filtered link, allow the link/expando to be shown", 
            "フィルタしたリンクのコメントページで、リンクの表示を許可する。（※とあるがRES v4.6.0時点ではONでも表示されない。OFFだとフィルタしたと通知があるので、おそらくON時の動作がバグってる。）",
            "Don't filter anything on modqueue pages (modqueue, reports, spam)",     
            "modqueueページ（モデレーター用の違反報告、スパム報告の確認ページ）ではフィルタを行わない。",
            "Don't filter anything on users' profile pages",   
            "ユーザープロフィールページではフィルタを行わない。",
            "Allow RegExp in certain filteReddit fields.<br>If you have filters which start with <code>/</code> and don't know what RegExp is, you should turn this option off.<br>Find out more on the <a href=\"/r/Enhancement/wiki/index/filters/filtereddit/regexp\">/r/Enhancement wiki</a>.",
            "このページの設定項目で正規表現を有効にする。<br>/で始まるフィルターを使用していて、正規表現が何のことかわからない場合はoffにすべきです。<br>詳しくは <a href=\"/r/Enhancement/wiki/index/filters/filtereddit/regexp\">/r/Enhancement wiki</a> を見てください。",
            "Hide posts with certain keywords in the title.\n\n<br><br>RegExp like <code>/(this|that|theother)/i</code> is allowed for keyword (but not unlessKeyword).\n\n<br>Find out more on the <a href=\"/r/Enhancement/wiki/index/filters/filtereddit/regexp\">/r/Enhancement wiki</a>.",
            "タイトルに指定した文字列を含む投稿を隠します。<br><br>キーワードには <code>/(this|that|theother)/i</code> のようなJavaScriptの正規表現の記法が可能です。（除外キーワードには使用できません）<br>詳しくは <a href=\"/r/Enhancement/wiki/index/filters/filtereddit/regexp\">/r/Enhancement wiki</a> を見てください。",
            "keyword", 
            "キーワード",
            "applyTo",   
            "有効範囲",
            "subreddits",   
            "サブレディット（複数指定可）",
            "unlessKeyword",
            "除外キーワード",
            "Everywhere ",  
            "全ての場所",
            "Everywhere but: ",   
            "指定した場所以外",
            "Only on: ",  
            "指定した場所",
            "+add filter",  
            "フィルターを追加",
            "Hide posts submitted to certain subreddits.\n\n<br><br>RegExp like <code>/(this|that|theother)/i</code> is allowed for subreddit.\n\n<br>Find out more on the <a href=\"/r/Enhancement/wiki/index/filters/filtereddit/regexp\">/r/Enhancement wiki</a>.",
            "指定したサブレディットにされた投稿を隠します。<br><br><code>/(this|that|theother)/i</code> のようなJavaScriptの正規表現の記法が可能です。<br>詳しくは <a href=\"/r/Enhancement/wiki/index/filters/filtereddit/regexp\">/r/Enhancement wiki</a> を見てください。",
            "subreddit",        
            "サブレディット",
            "Everywhere except inside a subreddit ",
            "サブレディットの中を除く全ての場所 ",
            "/r/all and domain pages ",
            "/r/all とドメインページ ",
            "Hide posts that link to certain domains.\n\n<br><br>Caution: domain keywords like \"reddit\" would ignore \"reddit.com\" and \"fooredditbar.com\".\n\n<br><br>RegExp like <code>/(this|that|theother)/i</code> is allowed for domain.\n\n<br>Find out more on the <a href=\"/r/Enhancement/wiki/index/filters/filtereddit/regexp\">/r/Enhancement wiki</a>.",
            "指定したドメインにリンクしている投稿を隠します。<br><br>注意：\"reddit\"と指定した場合、\"reddit.com\" や \"fooredditbar.com\" が対象になります。（指定した文字列が含まれていればマッチする）<br><br><code>/(this|that|theother)/i</code> のようなJavaScriptの正規表現の記法が可能です。<br>詳しくは <a href=\"/r/Enhancement/wiki/index/filters/filtereddit/regexp\">/r/Enhancement wiki</a> を見てください。",
            "Hide in posts where certain keywords are in the post's link flair\n\n<br><br>RegExp like <code>/(this|that|theother)/i</code> is allowed for flair.\n\n<br>Find out more on the <a href=\"/r/Enhancement/wiki/index/filters/filtereddit/regexp\">/r/Enhancement wiki</a>.",
            "リンクフレアーに指定した文字列を含む投稿を隠します。<br><br><code>/(this|that|theother)/i</code> のようなJavaScriptの正規表現の記法が可能です。<br>詳しくは <a href=\"/r/Enhancement/wiki/index/filters/filtereddit/regexp\">/r/Enhancement wiki</a> を見てください。",
            "Don't hide NSFW posts from certain subreddits when the NSFW filter is turned on.",
            "NSFWフィルターが有効でも、NSFWな投稿を隠さないサブレディットを指定します。",
            "+add subreddits",  
            "サブレディットを追加",
            "where",   
            "条件",
            "Everywhere ",  
            "全ての場所",
            "When browsing subreddit/multi-subreddit ",   
            "サブレディット/マルチレディットを見ているとき",
            "Hide posts based on complex custom criteria. <p>This is a very advanced feature, please <a href=\"http://www.reddit.com/r/Enhancement/wiki/customfilters\">read the guide</a> before asking questions.  </p><p style=\"font-weight: bold; font-size: 16pt;\">This feature is currently in beta. Filters may break in future RES updates.</p>",
            "複雑な条件で投稿を隠すことができます。<p>これは超上級者向けの機能なので質問する前に <a href=\"http://www.reddit.com/r/Enhancement/wiki/customfilters\">ガイド</a> を読んでください。</p><p style=\"font-weight: bold; font-size: 16pt;\">この機能はベータ版です。今後のアップデートで設定が使用できなくなる可能性があります。</p>",
        ]),
        function() {
            AddDescription("optionContainer-filteReddit-filterSubredditsFrom", "（※ドメインページとは /domain/www.source.com/ のようなページの事です。例の場合は www.source.com にリンクしている投稿が全て表示されるページになります。）");
        }
    );
    TranslateModule(
        "newCommentCount", "新着コメント数カウント", TranslateData([     
            "Shows how many new comments there are since your last visit.",      
            "あなたが最後に訪れてからいくつのコメントが付いたかを表示します。（※RESにバグがあるため、redditの個人設定で言語が日本語だと正しく表示されません）",
            "Clean out cached comment counts of pages you haven't visited in [x] days - enter a number here only!",     
            "訪れなかった場合にコメント数の記憶をクリアするまでの日数。",
            "Automatically remove thread subscriptions in [x] days (enter zero to keep subscriptions indefinitely) - enter a number here only!",   
            "サブミッションの購読を自動停止するまでの日数。（0にすると無期限）",
        ])
    );
    TranslateModule(
        "spamButton", "スパム報告ボタン", TranslateData([  
            "Adds a Spam button to posts for easy reporting.",    
            "違反報告のための「rts」ボタンを追加します。各書き込みの下側のflair（フレアー）またはgive gold（goldを贈る）の右隣に表示されます。",
        ])
    );
    TranslateModule(
        "submitHelper", "投稿補助", TranslateData([ 
            "Provides utilities to help with submitting a post.",
            "投稿を補助します。",
            //"Show a warning when the current URL has already been submitted to the selected subreddit. ",
            //"現在のURLが選択したサブレディットにすでに投稿済みの場合、警告を表示する。",
            //"Not 100% accurate, due to search limitations and different ways to format the same URL.",
            //"検索に制約があることと同じURLをいくつかの方法で表現できることにより100%の精度はありません。",
            "Show a warning when the current URL has already been submitted to the selected subreddit. <p><i>Not 100% accurate, due to search limitations and different ways to format the same URL.</i></p>",
            "現在のURLが選択したサブレディットにすでに投稿済みの場合、警告を表示する。<p><b>検索上の制約により100%の精度はありません。</b></p>",
            "Uncheck \"send replies to my inbox\" by default, when submitting a new post.",
            "新しく投稿するとき、\"send replies to my inbox\"（my inbox内に返信を送信）の初期値をoffにする。",
        ])
    );
    TranslateModule(
        "subredditInfo", "サブレディット情報", TranslateData([     
            "Adds a hover tooltip to subreddits", 
            "サブレディットにマウスオーバーした時にツールチップを表示する。",
            "Delay, in milliseconds, before hover tooltip loads. Default is 800.",     
            "マウスオーバー時に情報を読み込むまでの待ち時間をミリ秒単位で指定。（初期値：800）",
            "Delay, in milliseconds, before hover tooltip fades away. Default is 200.", 
            "マウスカーソルが離れてからツールチップが消えるまでの待ち時間をミリ秒単位で指定。（初期値：200）",
            "Fade animation's speed (in seconds). Default is 0.7.",
            "フェード時間を秒単位で指定。（初期値：0.7）",
            "Show date (subreddit created...) in US format (i.e. 08-31-2010)",   
            "subreddit created...の日時表示をUSフォーマットにする。（月-日-年の順）",
        ])
    );
    TranslateModule(
        "subredditManager", "サブレディットマネージャー", TranslateData([  
            "Allows you to customize the top bar with your own subreddit shortcuts, including dropdown menus of multi-reddits and more.",
            "トップバーをカスタマイズ可能にして、ショートカットやマルチレディットのドロップダウンを登録できるようにする。",
            "Add +shortcut button in subreddit sidebar for easy addition of shortcuts.",
            "ショートカットを簡単登録できるように、サブレディットのサイドバーに [+shortcut] ボタンを追加する。",
            "Show personalized shortcuts for each account",
            "アカウントごとに設定されたショートカットを表示する。",
            "For multi-subreddit shortcuts like a+b+c/x, show a dropdown like a/x, b/x, c/x",
            "マルチレディットショートカットの解釈方法を変更する。（例：onの場合、a/x+b/yはa/x/y, b/yと解釈され、offの場合はa/x, b/yと解釈される）",
            "Show \"edit\" and \"delete\" buttons in dropdown menu on subreddit shortcut bar",
            "トップバー（サブレディットのショートカット）のドロップダウンメニューに\"edit\"と\"delete\"ボタンを表示する。",
            "How long (in milliseconds) to wait after moving your mouse over a shortcut to show its dropdown. (This particularly applies for shortcuts to multi-subreddits like sub1+sub2+sub3.)",
            "ミリ秒　ショートカットにマウスオーバーしてからドロップダウンが表示されるまでの待ち時間。（ショートカットにマルチレディットが登録されている場合）",
            "How long (in milliseconds) to wait after moving your mouse over a shortcut to show its dropdown edit buttons. (This particularly applies to just the edit/delete button dropdown.)",
            "ミリ秒　ショートカットにマウスオーバーしてから編集/削除のドロップダウンが表示されるまでの待ち時間。（ショートカットに単一のサブレディットが登録されている場合）",
            "Allow lowercase letters in shortcuts instead of forcing uppercase",
            "ショートカットの文字列に大文字を強制しないで小文字を許可する。",
            "Show last update information on the front page (work only if you have at least 50/100 subscription, see <a href=\"/r/help/wiki/faq#wiki_some_of_my_subreddits_keep_disappearing.__why.3F\">here</a> for more info).",
            "フロントページで最新更新情報を表示する。（通常アカウントでは50以上、goldアカウントでは100以上のサブレディットを購読している場合のみ効果があります。詳しくは <a href=\"/r/help/wiki/faq#wiki_some_of_my_subreddits_keep_disappearing.__why.3F\">ここ</a> を見てください。",
        ]),
        function() {
            TranslateDescriptionByRegExp(/show "([\w.]*)" (link|button) in subreddit manager/i, "トップバーに[$1]を表示する。");
        }
    );
    TranslateModule(
        "subRedditTagger", "サブレディット タグ", TranslateData([  
            "Adds tags to posts based on which subreddit they were posted to.",
            "投稿されたサブレディットを元にタグを追加します。",
            "Set your subreddit-specific tags below. You can avoid double tagging a post that has already been tagged by using the \"doesntContain\" field. So, if you want to make sure that all ",
            "サブレディットごとのタグを設定してください。タグが二重に付いてしまわないように含まない文字列を設定する必要があります。もし",
            " posts are tagged [TOMT], even if the user has forgotten, then put \"tipofmytongue\" as the subreddit, \"TOMT\" in the \"doesntContain\" field, and \"[TOMT]\" in the tag field. Subreddit tagger looks for the \"doesntContain\" text in the post's title and flair",
            "というサブレディットの投稿に[TOMT]というタグを付けたいのなら、サブレディットにtipsofmytongue、タグに[TOMT]、含まない文字列にTOMTを設定してください。含まない文字列は投稿のタイトルとフレアーを確認対象とします。",
            "subreddit",
            "サブレディット",
            "doesntContain",
            "含まない文字列",
            "tag",
            "タグ",
            "+add tag",
            "項目を追加",
        ])
    );
    TranslateModule(
        "betteReddit", "ベターレディット", TranslateData([     
            "Adds a number of interface enhancements to Reddit, such as \"full comments\" links, the ability to unhide accidentally hidden posts, and more",   
            "いくつかの操作性向上を行います。間違って隠してしまった全ての投稿を元に戻すなどの機能があります。",
            "Add \"full comments\" link to comment replies, etc.", 
            "コメントの返信などに\"full comments\"リンクを追加する。",
            "Text of full comments link.",  
            "full commentsリンクを何と表示するか。",
            "Open links found in comments in a new tab.", 
            "コメント中のリンクを新しいタブで開く。",
            "Changes \"hide\" links to read as \"hide\" or \"unhide\" depending on the hide state. Also adds a 5 second delay prior to hiding the link.", 
            "表示状態によってhide/unhideが（隠す/隠すのをやめる）切り替わるようにします。また、表示を消す前に5秒間の猶予を追加します。",
            "Show lengths of videos when possible",
            "ビデオの長さが分かる場合は表示する。",
            "Show upload date of videos when possible",
            "ビデオのアップロード日が分かる場合は表示する。",
            "Show number of views for a video when possible",
            "ビデオの再生数が分かる場合は表示する。",
            "None ",
            "なし",
            "Subreddit Bar only ",
            "サブレディットバー",
            "User Bar ",
            "ユーザーバー",
            "Subreddit Bar and User bar ",
            "サブレディットバーとユーザーバー",
            "Full Header ",
            "ヘッダ全体",
            "Pin the subreddit bar, user menu, or header to top, floating down as you scroll.",
            "サブレディットバー・ユーザーバー・ヘッダーを固定して、スクロールについてくるようにします。",
            "Don't use Reddit Toolbar when linking to sites that may not function (twitter, youtube and others)",   
            "レディットツールバーが使えない可能性があるサイトにリンクしている時は使わない。",
            "Show the time that a text post/comment was edited, without having to hover the timestamp.",  
            "タイムスタンプにマウスオーバーしなくても投稿やコメントの編集時刻を表示する。",
            "When hovering [score hidden] show time left instead of hide duration.",    
            "[score hidden]にマウスオーバーした時、非表示の時間ではなく残り時間を表示する。",
            "Show the precise date (Sun Nov 16 20:14:56 2014 UTC) instead of a relative date (7 days ago), for posts.",
            "投稿の日時を相対的（～日前など）ではなく正確に（Sun Nov 16 20:14:56 2014 UTCのように）表示する。",
            "Show the precise date for comments / messages.",
            "コメントとメッセージの日時を正確に表示する。",
            "Show the precise date in the sidebar.",
            "サイドバーの更新日時を正確に表示する。",
            "Show the precise date in the wiki.",
            "wikiの更新日時を正確に表示する。",
            "Show the precise date in the moderation log (/r/mod/about/log).",
            "モデレーションログにおける日時を正確に表示する。",
            "The saved tab is now located in the multireddit sidebar. This will restore a \"saved\" link to the header (next to the \"hot\", \"new\", etc. tabs).",  
            "savedタブ（マルチレディット・フロントページのサイドバーにある）をヘッダー（\"hot\"や\"new\"のある列）に表示する。",
            "Modify reddit's comment/link buttons (\"perma-link source save...\") such that they don't show up in searches. Disabled by default due to a slight performance impact.",
            "コメントやリンクについているボタン（コメント数や返信ボタンがある列）をブラウザによるページ内検索（Ctrl+F）の対象にならないように細工する。負荷がやや高いため初期設定はoffです。",
        ])
    );
    TranslateModule(
        "spoilerTags", "スポイラータグ", TranslateData([  
            "Hide spoiler-tagged comments on user profiles until moused over.",
            "ネタバレとマークされたコメントはマウスオーバーするまで表示しないようにします。",
            "Delay showing spoiler text momentarily",
            "ネタバレを表示するとき、少し待ち時間を設ける。",            
        ])
    );
    TranslateModule(
        "nightMode", "ナイトモード", TranslateData([ 
            "A darker, more eye-friendly version of Reddit suited for night browsing.		",
            "明るさを抑え、夜の閲覧用に目に優しい表示にします。",
            "Note: Using this on/off switch will disable all features of the night mode module completely.		",
            "注意：ここで機能を無効にするとナイトモードの全ての機能が無効になります。",
            "To simply turn off night mode, use the nightModeOn switch below.",
            "単に今はナイトモードを無効にしておきたいだけ（ナイトモードを後で使うつもりがある）なら下のnightModeOnスイッチを使用してください。",
            "Enable/disable night mode.",
            "ナイトモードのon/offを切り替える。",
            "Enable night switch, a toggle between day and night reddit located in the Settings dropdown menu.",
            "歯車メニュー内にナイトモードの切り替えスイッチを表示する。",
            "Enable automatic night mode—night mode automatically starts and stops at the times configured below.				<br><br>For the times below, a 24-hour clock (\"military time\") from 0:00 to 23:59 is used.				<br>e.g. the time 8:20pm would be written as 20:20, and 12:30am would be written as 00:30 or 0:30.				<br><br>To temporarily override automatic night mode, manually flip the night mode switch.				<br>Configure how long the override lasts below.",
            "時刻に応じて自動的にナイトモードに切り替える。",
            "Time that automatic night mode starts. Default is 20:00 (8:00pm).",
            "ナイトモードを開始する時刻を設定する（24時間制）。デフォルトは20：00です。",
            "Time that automatic night mode ends. Default is 6:00 (6:00am).",
            "ナイトモードを終了する時刻を設定する（24時間制）。デフォルトは6：00です。",
            "Number of hours that the automatic night mode override lasts. Default is 8 (hours).				",
            "ナイトモードを上書きする時間（ナイトモード中に手動でoffにした場合、何時間後にonに戻すか）を設定する。デフォルトは8時間で、例えば0.1を設定すると6分となります。",
            "You can use a decimal number of hours here as well; e.g. 0.1 hours (which is 6 min).",
            "",
            "Don't disable subreddit styles by default when using night mode.				<br><br>When using night mode, subreddit styles are automatically disabled unless <a href=\"/r/Enhancement/wiki/subredditstyling#wiki_res_night_mode_and_your_subreddit\">the subreddit indicates it is night mode-friendly</a>. You must tick the \"Use subreddit stylesheet\" in a subreddit's sidebar to enable subreddit styles in that subreddit. This is because most subreddits are not night mode-friendly.				<br><br>If you choose to show subreddit styles, you will see flair images and spoiler tags, but be warned: <em>you may see bright images, comment highlighting, etc.</em> It is up to the mods of each subreddit to make their sub night mode friendly, which is not a tiny amount of work. Please be polite when requesting moderators make a sub night mode friendly.", 
            "ナイトモードに対応していなくてもサブレディットのスタイルを使用する。<br><br>これによりスポイラータグ（ネタバレ防止）が機能しなかったり、ナイトモードにふさわしくない明るい表示になることがあります。<br><br>根本的な解決にはモデレーターにナイトモード対応のスタイルを作成してもらう必要がありますが、かなり手間がかかるので無理な注文を付けないようにしてください。<a href=\"/r/Enhancement/wiki/subredditstyling#wiki_res_night_mode_and_your_subreddit\">ナイトモードに対応させる方法についてはこちら</a>。",
            "Allow the subreddits listed to display subreddit styles during night mode if useSubredditStyles is disabled.",
            "useSubredditStylesがoffでも、ここに指定したサブレディットではナイトモード時にサブレディットのスタイルを使用する。",
        ])
    );
    TranslateModule(
        "selectedEntry", "選択項目", TranslateData([       
            "When a post or comment is selected, show extra styling and tools",
            "投稿やコメントが選択されたとき、特別な見た目とツールを表示します。",
            "Automatically select the topmost element for keyboard navigation on window scroll",
            "キーボード操作時、ウィンドウがスクロールしたら自動的に一番上の項目を選択する。",
            "Select a link or comment when clicked with the mouse",
            "マウスでクリックしたリンクやコメントを選択する。",
            "Set a background color to highlight the currently focused element", 
            "選択中の項目を強調するために背景色を設定する。",
            "Background color of focused element",
            "選択中の項目の背景色。",
            "Background color of focused element in Night Mode",
            "ナイトモード時の選択中の項目の背景色。",
            "Foreground color of focused element in Night Mode",
            "ナイトモード時の選択中の項目の色。",
            "Set a border to highlight the currently focused element", 
            "選択中の項目を強調するためにボーダーを設定する。",
            "border style (e.g. 1px dashed gray) for focused element",
            "選択中の項目のボーダースタイル。（例：1px dashed gray）",
            "border style (e.g. 1px dashed gray) for focused element in Night Mode",
            "ナイトモード時の選択中の項目のボーダースタイル。（例：1px dashed gray）",
        ])
    );
    TranslateModule(
        "stylesheet", "スタイルシートローダー", TranslateData([
            "Load stylesheets from other subreddits or load your own CSS snippets.",
            "他のサブレディット、または自分で用意したCSSを読み込むことができます。",
            "learn more",
            "詳しく見る",
            "reddit allows you to customize the appearance of reddit! A reddit theme will be applied anywhere the default reddit style is present and subreddit style is disabled via reddit.",
            "redditでは自由に見た目をカスタマイズできます！redditテーマはデフォルトのredditスタイルを使用している場所とredditの設定でサブレディットスタイルを無効にした場所で適用できます。（※reddit goldメンバー専用）",
            "subreddit",
            "スタイルシートを読み込むサブレディット",
            "applyTo",
            "適用範囲",
            "applyToSubreddits",
            "サブレディット",
            "Everywhere ",
            "全ての場所 ",
            "Everywhere but: ",
            "指定した場所以外 ",
            "Only on: ",
            "指定した場所 ",
            "Add Row",
            "行を追加",
            "When browsing a subreddit, add the subreddit name as a class to the body.\n\n<br><br>For example, /r/ExampleSubreddit adds <code>body.res-r-examplesubreddit</code>",
            "サブレディットを見ているとき、サブレディットの名前をbodyタグのclassに追加します。<br><br>例えば /r/ExampleSubreddit を見ているなら <code>body.res-r-examplesubreddit</code> が追加されます。",
            "When browsing a multireddit, add the multireddit name as a class to the body.\n\n<br><br>For example, /u/ExampleUser/m/ExampleMulti adds <code>body.res-user-exampleuser-m-examplemulti</code>",
            "マルチレディットを見ているとき、マルチレディットの名前をbodyタグのclassに追加します。<br><br>例えば /u/ExampleUser/m/ExampleMulti を見ているなら <code>body.res-user-exampleuser-m-examplemulti</code> が追加されます。",
            "When browsing a user profile, add the username as a class to the body.\n\n<br><br>For example, /u/ExampleUser adds <code>body.res-user-exampleuser</code>",
            "ユーザープロファイルを見ているとき、ユーザーの名前をbodyタグのclassに追加します。<br><br>例えば /u/ExampleUser を見ているなら <code>body.res-user-exampleuser</code> が追加されます。",
            "When logged in, add your username as a class to the body.\n\n<br><br>For example, /u/ExampleUser adds <code>body.res-me-exampleuser</code>",
            "ログインしている間、あなたのユーザー名をbodyタグのclassに追加します。例えばあなたが /u/ExampleUser なら <code>body.res-me-exampleuser</code> が追加されます。",
        ]),
        function() {
            AddDescription("optionContainer-stylesheet-loadSubredditStylesheets", "他のサブレディット、または自分で用意したCSSを読み込むことができます。（※この機能はgoldメンバーでなくても使用できます）");
        }
    );
    TranslateModule(
        "tableTools", "表組み立てツール", TranslateData([     
            "Include additional functionality to Reddit Markdown tables (only sorting at the moment).",
            "Redditマークダウンで記述した表に機能を追加する（今のところソート機能しかありません）",
            "Enable column sorting.",
            "カラムのソートを有効にする。",
        ])
    );
    TranslateModule(
        "voteEnhancements", "投票拡張", TranslateData([     
            "Format or show additional information about votes on posts and comments.",
            "投稿とコメントへの投票について追加情報を表示する。",
            "Calculate a post's score from its points and \"liked\" percentage.",
            "投稿のスコアとupvoteの割合からupvote数とdownvote数を計算して表示する。",
            "Calculate the total number of votes.",
            "投票数を計算して表示する。",
            "Bolden post and comment scores, making them easier to find.",
            "投稿とコメントのスコアを太字にして見つけやすくする。",
            "No coloration ",
            " 色を付けない ",
            "Automatic coloration ",
            " 自動で色を付ける ",
            "User-defined coloration ",
            " ユーザー定義の色付け ",
            "Add color to a link's score depending on its value.",
            "リンクのスコアの値に応じて色を付ける。",
            "				This does not work with reddit's \"compressed link display\" preference.",
            "この機能はredditの設定で\"compressed link display\"が有効だと機能しません。",
            "Choose a color for colorLinkScore with a threshold of your choice.",
            "閾値と色を設定してください。",
            "score",
            "スコア",
            "color",
            "色",
            "Reddit Classic ",
            "レディットの旧スタイル ",
            "Add color to a comment's score depending on its value.",
            "コメントのスコアの値に応じて色を付ける。",
            "Add color to the \"controversial\" comment indicator.", 
            "論争中のコメントに色を付ける。",
            "Select a color for the \"controversial\" comment indicator.",
            "論争中のコメントを示す色。",
        ])
    );
    TranslateModule(
        "showImages", "インラインイメージビューア", TranslateData([       
            "Opens images inline in your browser with the click of a button. Also has configuration options, check it out!",
            "投稿やコメントに画像URLがあった場合、ページを移動せずに画像を展開できるようにします。",
            "Conserve memory by temporarily hiding images when they are offscreen.",
            "表示領域から外れた画像を非表示にしてメモリーを節約する。",
            "Preload gallery images for faster browsing. Beware: this is at the expense of lots of bandwidth usage.",
            "画像の先読みを行うことで表示の高速化を行う。注意：この機能は通信量を増大させます。",
            "Hide images that are further than x screens away to save memory. A higher value means less flicker, but less memory savings.",
            "指定した画面分離れた画像を隠す。大きくするほど再表示が遅れにくくなりますが、メモリー節約効果も低下します。",
            "Max width of image displayed onscreen",
            "画像を表示する時の最大の幅。",
            "Max height of image displayed onscreen",
            "画像を表示する時の最大の高さ。",
            "Display each image's original (unresized) resolution in a tooltip.",
            "画像のオリジナル解像度をツールチップ（マウスオーバー時に出る）で表示する。",
            "Add a scroll bar to text expandos taller than [x] pixels (enter zero for unlimited).",
            "クリックして展開するテキストが指定した高さ（単位：ピクセル）よりも長い場合はスクロールバーを表示する。（0の場合はスクロールバーを表示しない）",
            "Add a scroll bar to comments taller than [x] pixels (enter zero for unlimited).",
            "指定した高さ（単位：ピクセル）よりも長いコメントならスクロールバーを表示する。（0の場合はスクロールバーを表示しない）",
            "Increase the max height of a self-text expando or comment if an expando is taller than the current max height.				This only takes effect if max height is specified (previous two options).",
            "展開するテキストまたはコメントが長い場合は高さを伸ばす。（上の二つの設定が有効な場合のみ）",
            "Open images in a new tab/window when clicked?",
            "画像クリックしたとき新しいタブまたはウィンドウで開く。",
            "If checked, do not show images marked NSFW.",
            "NSFW（仕事場で見ない方が良いエロなど）とマークされた画像を開かない。",
            "Add special styling to expando buttons for images marked NSFW.",
            "NSFWとマークされた画像・動画の展開ボタンを特別なスタイルにする。",
            "When loading selftext from an Aa+ expando, auto expand images, videos, and embeds.",
            "[Aa+]ボタンを押してテキストを展開する時、画像やビデオも展開する。",
            "Allow dragging to resize/zoom images.",
            "マウスドラッグで画像をリサイズできるようにする。",
            "Allow dragging while holding shift to move images.",
            "シフトキーを押しながらマウスドラッグで画像を移動できるようにする。",
            "Show educational tooltips, such as showing \"drag to resize\" when your mouse hovers over an image.",
            "画像にマウスオーバーした時にdrag to resize（ドラッグしてリサイズできます）などの表示をする。（残念ながらその時の表示は日本語化されません）",
            "Mark links visited when you view images (does eat some resources).",
            "画像を見たとき、それをすでに見た画像としてマークする。（いくらかのリソースを消費します）",
            "Add links to history ",
            "リンクを履歴に残す ",
            "Color links, but do not add to history ",
            "リンクに色は付けるが履歴には残さない ",
            "Do not add or color links. ",
            "リンクに色を付けず履歴にも残さない ",
            "Keeps NSFW links from being added to your browser history ",
            "NSFWなリンクをmarkVisited機能によりブラウザの履歴に残すか選びます。",
            "by the markVisited feature",
            "",
            "If you chose the second option, then links will be blue again on refresh.",
            "二番目のオプションを選んだ場合、再読み込みで元の色に戻ります。",
            "This does not change your basic browser behavior.				If you click on a link then it will still be added to your history normally.				This is not a substitute for using your browser's privacy mode.",
            "この機能はブラウザの基本機能を変更するわけではなく、リンクをクリックすると履歴に残ります。この機能はブラウザのプライバシーモードの代わりにはなりません。",
            "Do not create expandos for images that appear multiple times in a page.",
            "1ページ中に同じ画像が複数回出てきた場合は展開ボタンを作らない。",
            "Retrieve image captions/attribution information.",        "画像のタイトルや属性情報を取得する。",
            "Display all images at once in a 'filmstrip' layout, rather than the default navigable 'slideshow' style.",
            "全ての画像をデフォルトのスライドショースタイルではなくフィルムストリップ レイアウトで表示する。",
            "Use the 'slideshow' style for albums with more images than this number. (0 for always use 'filmstrip')",
            "以上の画像を含むアルバムはスライドショースタイルで表示する。（0の場合、常にフィルムストリップ）",
            "Convert Gif links to Gfycat links.",
            "GIF画像へのリンクをGfycatへのリンクに変換する。",
            "Show a 'view images' tab at the top of each subreddit, to easily toggle showing all images at once.",
            "view imagesタブを各サブレディットのトップに表示する。これにより全ての画像を一気に開閉できます。",
            "Autoplay inline videos",
            "インラインビデオを自動再生する。",
            "Prefer RES support for imgur albums rather than reddit's built in support",
            "redditの標準機能の代わりにRESによるimgurアルバム機能を使う。",
            "Show a toggle for radd.it embeds in subreddits with sidebar links to a raddit.com/r/subreddit playlist",
            "サブレディットのサイドバーリンクに埋め込まれたradd.itのリンクをraddit.com/r/subredditプレイリストに置き換えるボタンを表示する。",
            "Start playing the radd.it sidebar embed when opening it",
            "埋め込まれたradd.itサイドバーを開いたときに再生を始める。",
            "Always show the radd.it embed in the sidebar when applicable",
            "可能なら常にradd.itの埋め込みを表示する。",
            "The maximum width of pastebin expandos. (any valid CSS width, default 80em)",
            "pastebinの展開の最大幅（CSSで幅として指定できる値が使えます　デフォルト：80em）",
        ]),
        function() {
            TranslateDescriptionByRegExp(/display expander for (.*)/i, "$1の展開ボタンを表示する。");
        }
    );
    TranslateModule(
        "keyboardNav", "キーボード操作", TranslateData([  
            "Keyboard navigation for reddit!",
            "キーボードでredditを操作できます！",
            "If media is open on the currently selected post when moving up/down one post, open media on the next post.",
            "現在選択中の投稿のメディアを開いている場合は、上/下に移動したときにメディアを開く。",
            "Scroll window to top of link when expando key is used (to keep pics etc in view)",
            "展開キーを押した時、ウィンドウをスクロールする。（画像が画面におさまるようにするため）",
            "When moving up/down with keynav, when and how should RES scroll the window?",
            "キーボードで上/下に移動する時、いつどのようにウィンドウをスクロールしますか？",
            "Directional: Scroll just enough to bring the selected element into view, if it's offscreen.",
            "Directional: 選択中の項目が画面に入るようにスクロールします。",
            "Page up/down: Scroll up/down an entire page after reaching the top or bottom.",
            "Page up/down: 画面の一番上/下に移動したときに、ページ単位でスクロールします。",
            "Lock to top: Always align the selected element to the top of the screen.",
            "Lock to top: 選択中の項目が常に画面の一番上になるようにします。",
            "Assign number keys (e.g. [1]) to links within selected comment",
            "選択したコメント中のリンクに[数字]を割り当てる。（対応する数字キーを押すと、そのリンクを開けます）",
            "Place on right ",
            " 右側 ",
            "Place on left ",
            " 左側 ",
            "Which side commentsLinkNumbers are displayed",
            "commentsLinkNumbersで割り当てた[数字]をどちらに表示するか選びます。",
            "Open number key links in a new tab",
            "数字キーでリンクを開くとき、新しいタブで開きます。",
            "After hiding a link, automatically select the next link",
            "リンクを非表示にした後、次のリンクを自動的に選択する。",
            "After voting on a link, automatically select the next link",
            "リンクに投票したら、自動で次のリンクを選択する。",
            "After voting on a comment, automatically select the next comment",
            "コメントに投票したら、自動で次のコメントを選択する。",
            "Use go mode (require go mode before \"go to\" shortcuts are used, e.g. frontpage)",
            "goモードを使用する。（goモードに入らないと[goモード対応]の移動操作ができないようにする/offなら直接移動可）",
            "When following a link in new tab - focus the tab?",
            "リンクを新しいタブで開くとき、そのタブをフォーカスする？",
            "Show help for keyboard shortcuts",
            "キーボードショートカットのヘルプを表示する。",
            "Enter \"go mode\" (next keypress goes to a location, e.g. frontpage)",
            "goモードに入る。",
            "Launch RES command line",
            "RESコマンドラインを開く。",
            "Hide link",
            "リンクを隠す。",
            "Move up to the previous link or comment in flat lists",
            "上に移動する。（前のリンクまたはコメント）（フラット表示のとき）",
            "Move down to the next link or comment in flat lists",
            "下に移動する。（次のリンクまたはコメント）（フラット表示のとき）",
            "Move up to the previous comment on threaded comment pages",
            "上に移動する。（スレッド表示のとき）",
            "Move down to the next comment on threaded comment pages",
            "下に移動する。（スレッド表示のとき）",
            "Move to top of list (on link pages)",
            "リストの先頭に移動する。（リンクページ専用）",
            "Move to bottom of list (on link pages)",
            "リストの最後に移動する。（リンクページ専用）",
            "Move to previous sibling (in comments) - skips to previous sibling at the same depth.",
            "前の兄弟コメントに移動する。同じ深さの前の兄弟までスキップします。",
            "Move to next sibling (in comments) - skips to next sibling at the same depth.",
            "次の兄弟コメントに移動する。同じ深さの次の兄弟までスキップします。",
            "Move to the topmost comment of the previous thread (in comments).",
            "前のスレッドの先頭のコメントに移動する。",
            "Move to the topmost comment of the next thread (in comments).",
            "次のスレッドの先頭のコメントに移動する。",
            "Move to the topmost comment of the current thread (in comments).",
            "現在のスレッドの先頭のコメントに移動する。",
            "Move to parent (in comments).",
            "親コメントに移動。",
            "Display parent comments.",
            "親コメントをポップアップ表示。",
            "Follow link (hold shift to open it in a new tab) (link pages only)",
            "リンクを開く。（シフトキーを押しながらだと新しいタブで開く）（リンクページのみ）",
            "Follow link in new tab (link pages only)",
            "リンクを新しいタブで開く。（リンクページのみ）",
            "Toggle expando (image/text/video) (link pages only)",
            "画像/テキスト/ビデオを展開する。（リンクページのみ）",
            "Increase the size of image(s) in the highlighted post area",
            "選択した投稿エリアの画像を大きくする。",
            "Decrease the size of image(s) in the highlighted post area",
            "選択した投稿エリアの画像を小さくする。",
            "Increase the size of image(s) in the highlighted post area (finer control)",
            "選択した投稿エリアの画像を大きくする。（より細かく調整できる）",
            "Decrease the size of image(s) in the highlighted post area (finer control)",
            "選択した投稿エリアの画像を小さくする。（より細かく調整できる）",
            "Move the image(s) in the highlighted post area up",
            "選択した投稿エリアの画像を上に移動する。",
            "Move the image(s) in the highlighted post area down",
            "選択した投稿エリアの画像を下に移動する。",
            "Move the image(s) in the highlighted post area left",
            "選択した投稿エリアの画像を左に移動する。",
            "Move the image(s) in the highlighted post area right",
            "選択した投稿エリアの画像を右に移動する。",
            "View the previous image of an inline gallery.",
            "インラインギャラリーの前のイメージを見る。（\"← 01 of 20 →\"のような表示がある場合の画像切り替えを行う）",
            "View the next image of an inline gallery.",
            "インラインギャラリーの次のイメージを見る。（\"← 01 of 20 →\"のような表示がある場合の画像切り替えを行う）",
            "Toggle \"view images\" button",
            "\"view images\"ボタン（ページ内の全ての画像を開閉）を押す。",
            "Expand/collapse comments (comments pages only)",
            "コメントの展開と折り畳み。（コメントページのみ）",
            "View comments for link (shift opens them in a new tab)",
            "コメントページを開く。（シフトを押しながらだと新しいタブで開く）",
            "View comments for link in a new tab",
            "コメントページを新しいタブで開く。",
            "View link and comments in new tabs",
            "リンクとコメントを新しいタブで開く。",
            "View link and comments in new background tabs",
            "リンクとコメントを新しいバックグラウンドタブで開く。",
            "Upvote selected link or comment (or remove the upvote)",
            "リンクまたはコメントにUpvoteする。（または取り消す）",
            "Downvote selected link or comment (or remove the downvote)",
            "リンクまたはコメントにDownvoteする。（または取り消す）",
            "Upvote selected link or comment (but don't remove the upvote)",
            "リンクまたはコメントにUpvoteする。（取り消しはしない）",
            "Downvote selected link or comment (but don't remove the downvote)",
            "リンクまたはコメントにDownvoteする。（取り消しはしない）",
            "Save the current post to your reddit account. This is accessible from anywhere that you're logged in, but does not preserve the original text if it's edited or deleted.",
            "投稿をredditアカウントに保存する。ログインすればどこからでもアクセスできますが、編集や削除によって影響を受けます。（投稿の内容ではなくアドレスを保存していると考えてください）",
            "Save the current comment to your reddit account. This is accessible from anywhere that you're logged in, but does not preserve the original text if it's edited or deleted.",
            "コメントをredditアカウントに保存する。ログインすればどこからでもアクセスできますが、編集や削除によって影響を受けます。（投稿の内容ではなくアドレスを保存していると考えてください）",
            "Save the current comment with RES. This does preserve the original text of the comment, but is only saved locally.",
            "投稿をRESに保存する。保存後にそのコメントが編集されても内容が維持されますが、保存したPCからしか見ることができません。",
            "Reply to current comment (comment pages only)",
            "コメントに返信する。（コメントページのみ）",
            "Open the current comment's permalink (comment pages only)",
            "コメントのパーマリンク（そのコメントだけ表示するリンク）を開く。（コメントページのみ）",
            "Open the current comment's permalink in a new tab (comment pages only)",
            "コメントのパーマリンクを新しいタブで開く。（コメントページのみ）",
            "Open the current markdown field in the big editor. (Only when a markdown form is focused)",
            "big editorを開く。（コメント編集中のみ）",
            "Go to subreddit of selected link (link pages only)",
            "選択したリンクが投稿されているサブレディットを開く。（リンクページをマルチレディットで表示している時などに有効）",
            "Go to subreddit of selected link in a new tab (link pages only)",
            "選択したリンクが投稿されているサブレディットを新しいタブで開く。（リンクページをマルチレディットで表示している時などに有効）",
            "Go to inbox",
            "[goモード対応] メッセージの受信箱を開く。",
            "Go to inbox in a new tab",
            "[goモード対応] メッセージの受信箱を新しいタブで開く。",
            "Go to modmail",
            "[goモード対応] modmailを開く。",
            "Go to modmail in a new tab",
            "[goモード対応] modmailを新しいタブで開く。",
            "Go to profile",
            "[goモード対応] プロフィールを開く。",
            "Go to profile in a new tab",
            "[goモード対応] プロフィールを新しいタブで開く。",
            "Go to front page",
            "[goモード対応] フロントページを開く。",
            "Go to subreddit front page",
            "[goモード対応] サブレディットのフロントページを開く。",
            "Go to a random subreddit",
            "[goモード対応] ランダムなサブレディットに行く。",
            "Go to next page (link list pages only)",
            "[goモード対応] 次のページに行く。（リンク一覧ページでのみ有効）",
            "Go to prev page (link list pages only)",
            "[goモード対応] 前のページに行く。（リンク一覧ページでのみ有効）",
            "Open Comment Navigator",
            "コメントナビゲーターを開く。",
            "Move up using Comment Navigator",
            "コメントナビゲーターを使用して上に移動する。",
            "Move down using Comment Navigator",
            "コメントナビゲーターを使用して下に移動する。",
            "Shows date in your local time zone when you hover over a relative date.",
            "1 days agoなどの表示にマウスオーバーした時に日付と時刻を表示する。",
            "Allow you to change the link on the reddit logo.",
            "redditロゴ（snoo）をクリックしたときの移動先を設定できます。",
            " Frontpage ",
            "フロントページ",
            " Current subreddit/multireddit ",
            "現在のサブレディット/マルチレディット",
            "Location when you click on the reddit logo.",
            "redditロゴ（snoo）をクリックしたときの移動先を設定してください。",
            "Inspired by modules like River of Reddit and Auto Pager - gives you a never ending stream of reddit goodness.",
            "次のページを自動的に読み込んで連結させる機能です。下にスクロールしていくだけでどんどん読むことができます。",
            "Return to the page you were last on when hitting \"back\" button?",
            "ブラウザの戻るボタンを押した時、最後に見ていたページに戻る。",
            "Automatically load new page on scroll (if off, you click to load)",
            "自動的に次のページを読み込む。（offの場合はクリックして読み込みます）",
            "Show a reminder to unpause Never-Ending Reddit after pausing",
            "Never Ending Reddit機能を一時停止した時、一時停止の解除を忘れないように通知する。",
            "Show \"paused\" bars icon when auto-load is paused and \"play\" wedge icon when active",
            "自動読み込みを中止している間は一時停止のアイコンを表示する。（onでは自動読み込み機能の「状態」を表示し、offでは「押した場合の変化」を表示します）",
        ])
    );
    TranslateModule(
        "logoLink", "ロゴリンク", TranslateData([
            "Allow you to change the link on the reddit logo.",
            "redditロゴ（snoo）をクリックしたときの移動先を設定できます。",
            "Frontpage ",
            "フロントページ ",
            "Dashboard ",
            "ダッシュボード ",
            "Current subreddit/multireddit ",
            "現在のサブレディット/マルチレディット ",
            "Location when you click on the reddit logo.",
            "redditロゴ（snoo）をクリックしたときの移動先を設定してください。",
        ])
    );
    TranslateModule(
        "neverEndingReddit", "次ページ自動読み込み", TranslateData([     
            "Inspired by modules like River of Reddit and Auto Pager - gives you a never ending stream of reddit goodness.",
            "次のページを自動的に読み込んで連結させる機能です。下にスクロールしていくだけでどんどん読むことができます。",
            "Return to the page you were last on when hitting \"back\" button?",
            "ブラウザの戻るボタンを押した時、最後に見ていたページに戻る。",
            "Automatically load new page on scroll (if off, you click to load)",
            "自動的に次のページを読み込む。（offの場合はクリックして読み込みます）",
            "Show a reminder to unpause Never-Ending Reddit after pausing",
            "Never Ending Reddit機能を一時停止した時、一時停止の解除を忘れないように通知する。",
            "Show \"paused\" bars icon when auto-load is paused and \"play\" wedge icon when active",
            "再生/一時停止の表示を逆転させます。（onでは自動読み込み機能の「現在の状態」を表示し、offでは「押した場合の変化」を表示します）",
            "Show the π server / debug details next to the floating Never-Ending Reddit tools",
            "πサーバーを表示する。（マウスオーバーでデバッグ情報表示）",
            "After auto-loading a certain number of pages, pause the auto-loader<br><br>0 or a negative number means Never-Ending Reddit will only pause when you click the play/pause button in the top right corner.",
            "指定したページ数を読み込んだら自動読み込みを一時停止する。（0またはマイナス値なら無限）",
            "Fade ",
            "半透明にする ",
            "Hide ",
            "隠す ",
            "Do not hide ",
            "隠さない ",
            "Fade or completely hide duplicate posts already showing on the page.",
            "次のページを連結する前に新しい投稿があった場合などに発生するダブりの扱い。",
        ])
    );
    TranslateModule(
        "pageNavigator", "ポストナビゲーター", TranslateData([
            "Provides a post navigation tool to get you up and down the page",
            "ページを進む/戻る機能を提供します。（※画面を下にスクロールさせたとき、上に戻るボタンが画面右上に表示されます。進む/戻るとありますが現時点では戻る機能だけのようです。）",
        ])
    );
    TranslateModule(
        "searchHelper", "検索補助", TranslateData([       
            "Provide help with the use of search.",
            "検索を手助けします。",
            "Allow you to choose sorting and time range on the search form of the side panel.",
            "サイドパネルで検索する時にソートと時間による絞り込みを可能にする。",
            "Request the \"legacy layout\" feature for reddit search.\n\n<br>This will only be available for a limited time.",
            "redditの検索で旧レイアウトを要求します。これは期間限定で利用可能です。",
            "When on a user profile, offer to search user's post from the subreddit or multireddit we come from.",
            "ユーザープロフィールにいるとき、サブレディットかマルチレディットからユーザーの投稿を検索する。",
            "When clicking on a post's flair, search its subreddit for that flair. <p>May not work in some subreddits that hide the actual flair and add pseudo-flair with CSS (only workaround is to disable subreddit style).</p>",
            "投稿のフレアーをクリックしたとき、そのフレアーでサブレディット内を検索する。<br>サブレディットによっては上手く動かない場合もあります。",
            "Add tabs to the search page.",
            "検索ページにタブを表示します。",
            "none ",
            "開かない  ",
            "The tab that will be expanded each time you search.",
            "デフォルトで開くタブ。<br>subreddits:検索にヒットしたサブレディットの一覧<br>limit to subreddit:検索するサブレディットの絞り込み<br>refine:検索オプションの説明",
            "Play a transition when you open and close tabs.",
            "タブの開閉をアニメーションで表示。",
        ])
    );
    TranslateModule(
        "singleClick", "シングルクリック", TranslateData([
            "Adds an [l+c] link that opens a link and the comments page in new tabs for you in one click.",
            "リンクとコメントを一回の操作で開く[l+c]リンクを表示します。リンクとコメントが同じページの場合は[l=c]リンクを表示します。",
            "open comments then link ",
            "コメント→リンクの順に開く ",
            "open link then comments ",
            "リンク→コメントの順に開く ",
            "What order to open the link/comments in.",
            "リンクとコメントを開く順番。",
            "Hide the [l=c] when the link is the same as the comments page",
            "リンクとコメントが同じページである場合の[l=c]リンクを表示しません。",
            "Open the [l+c] link in background tabs",
            "[l+c]・[l=c]リンクをバックグラウンドのタブで開く。",
        ])
    );
    TranslateModule(
        "floater", "フローター", TranslateData([
            "Managing free-floating RES elements",
            "Managing free-floating  RES elements<br>（※現在のところ設定項目はありません。画面をスクロールしたときに右上に出るボタン類などの処理を担当しているようです。）",
        ])
    );
    TranslateModule(
        "dashboard", "ダッシュボード", TranslateData([  
            "The RES Dashboard is home to a number of features including widgets and other useful tools",
            "RESダッシュボードではウィジットやその他の便利な機能を使えます。",
            "Show link to my dashboard in RES menu",
            "RESメニューに my dashboard（ダッシュボードを開く）を表示します。",
            "Number of posts to show by default in each widget",
            "各ウィジットで表示するデフォルトの投稿数。",
            "hot ",
            "hot（注目） ",
            "new ",
            "new（新着） ",
            "rising ",
            "rising（上昇中） ",
            "controversial ",
            "controversial（論争中） ",
            "top ",
            "top（トップ） ",
            "Default sort method for new widgets",
            "新しいウィジットのデフォルトのソート方法。",
            "Show +dashboard shortcut in sidebar for easy addition of dashboard widgets.",
            "ダッシュボードウィジットへの登録が簡単にできるように、サイドバーに [+dashboard] ボタンを表示する。",
            "How many user tags to show per page on the <a href=\"/r/Dashboard/#userTaggerContents\">my users tags</a> tab. (enter zero to show all on one page)",
            "<a href=\"/r/Dashboard/#userTaggerContents\">my users tags</a> タブで表示する1ページあたりの数。（0で全部になります）",
        ])
    );
    TranslateModule(
        "backupAndRestore", "バックアップと復元", TranslateData([ 
            "Backup and restore your Reddit Enhancement Suite settings.",
            "RESの設定をバックアップ・復元できます。",
            "backup",
            "バックアップ",
            "Download a backup of your current RES settings.",
            "RES設定ファイルをダウンロードします。",
            "restore",
            "復元",
            "Restore a backup of your RES settings. Warning: This will overwrite your current settings.",
            "バックアップからRESの設定を復元します。<b>警告：現在の設定が失われ、復元した設定に戻ります。</b>",
        ])
    );
    TranslateModule(
        "customToggles", "カスタムトグル", TranslateData([
            "Set up custom on/off switches for various parts of RES.",
            "RESの各機能をonf/offするカスタムスイッチをセットアップできます。<br>（※カスタムフィルターやスタイルシートローダーで設定した項目を切り替えることができるようです。）",
            "Enable or disable everything connected to this toggle; and optionally add a toggle to the RES gear dropdown menu",
            "トグルに関連付けた項目をここでon/offできます。歯車メニューでの表示名を設定することもできます（省略でメニューに非表示）。",
            "name",
            "toggleName",
            "enabled",
            "状態",
            "menuItem",
            "歯車メニューでの表示名",
        ])
    );
    TranslateModule(
        "presets", "プリセット", TranslateData([   
            "Select from various preset RES configurations. Each preset turns on or off various modules/options, but does not reset your entire configuration.",
            "RESの簡単設定ができます。いくつかの機能や設定をon/offしますが、全ての設定がリセットされるわけではありません。",
            "apply preset",
            "プリセットを適用",
            "RES Lite: just the popular stuff",
            "RESライト：定番の機能のみ。",
            "Turn off all the RES modules",
            "全ての機能をoffにする。",
            "Turn off notifications and hover pop-ups",
            "通知とマウスオーバー時のポップアップを全て無効にする。",
        ])
    );
    TranslateModule(
        "commandLine", "コマンドライン", TranslateData([
            "Command line for navigating reddit, toggling RES settings, and debugging RES",
            "Redditの操作やRES設定の変更・デバッグのためのコマンドライン（※コマンドラインは . キーを押すと開けます。テンキーには反応しません。）",
            "Launch",
            "起動",
            "Open the RES Command Line",
            "RESコマンドラインを開く"
        ]),
        function(){
            AddDescription("optionContainer-commandLine-menuItem", "歯車メニューにRESコマンドラインを開く項目を追加する");
            AddDescription("optionContainer-commandLine-launchFromMenuButton", "歯車ボタンをクリックしたとき、RESコマンドラインを開く");
        }
    );
    TranslateModule(
        "notifications", "通知", TranslateData([
            "Manage pop-up notifications for RES functions",
            "RESによるポップアップ通知を管理します。",
            "per notification type ","通知タイプごとに設定 ",
            "always sticky ","全ての通知で有効  ",
            "never sticky ","全ての通知で無効 ",
            "Sticky notifications remain visible until you click the close button.",
            "クリックして閉じるまで通知を表示し続ける。",
            "In milliseconds, length of time until a notification begins to disappear.",
            "通知が消えはじめるまでの時間をミリ秒単位で指定。",
            "In milliseconds, length of time available to stop a notification from disappearing.",
            "フェードアウト時間をミリ秒単位で指定。フェードアウト中にマウスオーバーすると通知の消去が一旦中止されます。",
            "Manage different types of notifications",
            "様々な通知タイプを管理します。",
            "manually register notification type",
            "新しい通知タイプを手動で登録する",
        ])
    );
    TranslateModule(
        "hover", "マウスオーバー", TranslateData([
            "Customize the behavior of the large informational pop-ups which appear when you hover your mouse over certain elements.",
            "いくつかの要素にマウスオーバーしたときの情報ウィンドウのポップアップをカスタマイズできます。",
            "Manage particular pop-ups",
            "ポップアップを管理します。",
        ]),
        function() {
            AddDescription("optionContainer-hover-openDelay", "ポップアップまでの待ち時間。");
            AddDescription("optionContainer-hover-fadeDelay", "フェードアウト時間をミリ秒単位で指定する。");
            AddDescription("optionContainer-hover-width", "ポップアップウィンドウの幅をミリ秒単位で指定する。");
            AddDescription("optionContainer-hover-closeOnMouseOut", "マウスカーソルが外に出たら閉じる。");
            AddDescription("optionContainer-hover-updatePositionOnScroll", "スクロール時に位置を調整する。（※詳細不明）");
        }
    );
    
    ClickActiveModule();
    document.getElementById("moduleOptionsSave").innerHTML = "設定を保存する";
    
    if(document.getElementById("RESConfigPanelModulesPane")){
        document.getElementById("RESConfigPanelModulesPane").setAttribute("translated_ja", "true");
    }
}

function TranslateKeyHelp(){
    var e = document.getElementById("keyHelp");
    if(e.getAttribute("translated_ja") === "true") return;
    Translate(
        e, TranslateData([
            "Show help for keyboard shortcuts",
            "キーボードショートカットのヘルプを表示する。",
            "Enter \"go mode\" (next keypress goes to a location, e.g. frontpage)",
            "goモードに入る。",
            "Launch RES command line",
            "RESコマンドラインを開く。",
            "Hide link",
            "リンクを隠す。",
            "Move up to the previous link or comment in flat lists",
            "上に移動する。（前のリンクまたはコメント）（フラット表示のとき）",
            "Move down to the next link or comment in flat lists",
            "下に移動する。（次のリンクまたはコメント）（フラット表示のとき）",
            "Move up to the previous comment on threaded comment pages",
            "上に移動する。（スレッド表示のとき）",
            "Move down to the next comment on threaded comment pages",
            "下に移動する。（スレッド表示のとき）",
            "Move to top of list (on link pages)",
            "リストの先頭に移動する。（リンクページ専用）",
            "Move to bottom of list (on link pages)",
            "リストの最後に移動する。（リンクページ専用）",
            "Move to previous sibling (in comments) - skips to previous sibling at the same depth.",
            "前の兄弟コメントに移動する。同じ深さの前の兄弟までスキップします。",
            "Move to next sibling (in comments) - skips to next sibling at the same depth.",
            "次の兄弟コメントに移動する。同じ深さの次の兄弟までスキップします。",
            "Move to the topmost comment of the previous thread (in comments).",
            "前のスレッドの先頭のコメントに移動する。",
            "Move to the topmost comment of the next thread (in comments).",
            "次のスレッドの先頭のコメントに移動する。",
            "Move to the topmost comment of the current thread (in comments).",
            "現在のスレッドの先頭のコメントに移動する。",
            "Move to parent (in comments).",
            "親コメントに移動。",
            "Display parent comments.",
            "親コメントをポップアップ表示。",
            "Follow link (hold shift to open it in a new tab) (link pages only)",
            "リンクを開く。（シフトキーを押しながらだと新しいタブで開く）（リンクページのみ）",
            "Follow link in new tab (link pages only)",
            "リンクを新しいタブで開く。（リンクページのみ）",
            "Toggle expando (image/text/video) (link pages only)",
            "画像/テキスト/ビデオを展開する。（リンクページのみ）",
            "Increase the size of image(s) in the highlighted post area",
            "選択した投稿エリアの画像を大きくする。",
            "Decrease the size of image(s) in the highlighted post area",
            "選択した投稿エリアの画像を小さくする。",
            "Increase the size of image(s) in the highlighted post area (finer control)",
            "選択した投稿エリアの画像を大きくする。（より細かく調整できる）",
            "Decrease the size of image(s) in the highlighted post area (finer control)",
            "選択した投稿エリアの画像を小さくする。（より細かく調整できる）",
            "Move the image(s) in the highlighted post area up",
            "選択した投稿エリアの画像を上に移動する。",
            "Move the image(s) in the highlighted post area down",
            "選択した投稿エリアの画像を下に移動する。",
            "Move the image(s) in the highlighted post area left",
            "選択した投稿エリアの画像を左に移動する。",
            "Move the image(s) in the highlighted post area right",
            "選択した投稿エリアの画像を右に移動する。",
            "View the previous image of an inline gallery.",
            "インラインギャラリーの前のイメージを見る。（\"← 01 of 20 →\"のような表示がある場合の画像切り替えを行う）",
            "View the next image of an inline gallery.",
            "インラインギャラリーの次のイメージを見る。（\"← 01 of 20 →\"のような表示がある場合の画像切り替えを行う）",
            "Toggle \"view images\" button",
            "\"view images\"ボタン（ページ内の全ての画像を開閉）を押す。",
            "Expand/collapse comments (comments pages only)",
            "コメントの展開と折り畳み。（コメントページのみ）",
            "View comments for link (shift opens them in a new tab)",
            "コメントページを開く。（シフトを押しながらだと新しいタブで開く）",
            "View comments for link in a new tab",
            "コメントページを新しいタブで開く。",
            "View link and comments in new tabs",
            "リンクとコメントを新しいタブで開く。",
            "View link and comments in new background tabs",
            "リンクとコメントを新しいバックグラウンドタブで開く。",
            "Upvote selected link or comment (or remove the upvote)",
            "リンクまたはコメントにUpvoteする。（または取り消す）",
            "Downvote selected link or comment (or remove the downvote)",
            "リンクまたはコメントにDownvoteする。（または取り消す）",
            "Upvote selected link or comment (but don't remove the upvote)",
            "リンクまたはコメントにUpvoteする。（取り消しはしない）",
            "Downvote selected link or comment (but don't remove the downvote)",
            "リンクまたはコメントにDownvoteする。（取り消しはしない）",
            "Save the current post to your reddit account. This is accessible from anywhere that you're logged in, but does not preserve the original text if it's edited or deleted.",
            "投稿をredditアカウントに保存する。ログインすればどこからでもアクセスできますが、編集や削除によって影響を受けます。（投稿の内容ではなくアドレスを保存していると考えてください）",
            "Save the current comment to your reddit account. This is accessible from anywhere that you're logged in, but does not preserve the original text if it's edited or deleted.",
            "コメントをredditアカウントに保存する。ログインすればどこからでもアクセスできますが、編集や削除によって影響を受けます。（投稿の内容ではなくアドレスを保存していると考えてください）",
            "Save the current comment with RES. This does preserve the original text of the comment, but is only saved locally.",
            "投稿をRESに保存する。保存後にそのコメントが編集されても内容が維持されますが、保存したPCからしか見ることができません。",
            "Reply to current comment (comment pages only)",
            "コメントに返信する。（コメントページのみ）",
            "Open the current comment's permalink (comment pages only)",
            "コメントのパーマリンク（そのコメントだけ表示するリンク）を開く。（コメントページのみ）",
            "Open the current comment's permalink in a new tab (comment pages only)",
            "コメントのパーマリンクを新しいタブで開く。（コメントページのみ）",
            "Open the current markdown field in the big editor. (Only when a markdown form is focused)",
            "big editorを開く。（コメント編集中のみ）",
            "Go to subreddit of selected link (link pages only)",
            "選択したリンクが投稿されているサブレディットを開く。（リンクページをマルチレディットで表示している時などに有効）",
            "Go to subreddit of selected link in a new tab (link pages only)",
            "選択したリンクが投稿されているサブレディットを新しいタブで開く。（リンクページをマルチレディットで表示している時などに有効）",
            "Go to inbox",
            "[goモード対応] メッセージの受信箱を開く。",
            "Go to inbox in a new tab",
            "[goモード対応] メッセージの受信箱を新しいタブで開く。",
            "Go to modmail",
            "[goモード対応] modmailを開く。",
            "Go to modmail in a new tab",
            "[goモード対応] modmailを新しいタブで開く。",
            "Go to profile",
            "[goモード対応] プロフィールを開く。",
            "Go to profile in a new tab",
            "[goモード対応] プロフィールを新しいタブで開く。",
            "Go to front page",
            "[goモード対応] フロントページを開く。",
            "Go to subreddit front page",
            "[goモード対応] サブレディットのフロントページを開く。",
            "Go to a random subreddit",
            "[goモード対応] ランダムなサブレディットに行く。",
            "Go to next page (link list pages only)",
            "[goモード対応] 次のページに行く。（リンク一覧ページでのみ有効）",
            "Go to prev page (link list pages only)",
            "[goモード対応] 前のページに行く。（リンク一覧ページでのみ有効）",
            "Open first link within comment.",
            "コメントの中の[1]番のリンクを開く。",
            "Open link #2 within comment.",
            "コメントの中の[2]番のリンクを開く。",
            "Open link #3 within comment.",
            "コメントの中の[3]番のリンクを開く。",
            "Open link #4 within comment.",
            "コメントの中の[4]番のリンクを開く。",
            "Open link #5 within comment.",
            "コメントの中の[5]番のリンクを開く。",
            "Open link #6 within comment.",
            "コメントの中の[6]番のリンクを開く。",
            "Open link #7 within comment.",
            "コメントの中の[7]番のリンクを開く。",
            "Open link #8 within comment.",
            "コメントの中の[8]番のリンクを開く。",
            "Open link #9 within comment.",
            "コメントの中の[9]番のリンクを開く。",
            "Open link #10 within comment.",
            "コメントの中の[10]番のリンクを開く。",
            "Open Comment Navigator",
            "コメントナビゲーターを開く。",
            "Move up using Comment Navigator",
            "コメントナビゲーターを使用して上に移動する。",
            "Move down using Comment Navigator",
            "コメントナビゲーターを使用して下に移動する。",
        ])
    );
    
    e.setAttribute("translated_ja", "true");
}

function start(){
	if(document.getElementById("RESClose")){
       TranslateSettings();
	}

    if(document.getElementById("keyHelp")){
		TranslateKeyHelp();
    }
/*    
    if(E("tip0")){
		TranslatePanel(E("tip0"));
    }
    if(E("RESNotifications")){
		TranslatePanel(E("RESNotifications"));
    }
    if(E("goModePanel")){
		TranslatePanel(E("goModePanel"));
    }
    if(E("moduleOptionsSave")){
        E("moduleOptionsSave").setAttribute("value", "設定を保存する");
    }
*/
    setTimeout(start, 1000);
}

//init();
start();
