const _0x1efbe8 = _0x34d8;
(function (_0x27db6e, _0x3db930) {
    const _0x45c6ad = _0x34d8, _0x5ee627 = _0x27db6e();
    while (!![]) {
        try {
            const _0x3eb38a = parseInt(_0x45c6ad(0x12f)) / (0x2 * 0x4a5 + -0x468 + 0x1 * -0x4e1) * (parseInt(_0x45c6ad(0xae)) / (-0x1cb5 + -0x17d9 + 0x692 * 0x8)) + -parseInt(_0x45c6ad(0x118)) / (0xd * -0x99 + 0xaa9 + 0xb * -0x43) * (-parseInt(_0x45c6ad(0xf2)) / (-0x1a1c + 0xfd + 0x1923)) + -parseInt(_0x45c6ad(0xe4)) / (-0xef * 0x3 + -0x1 * 0x1d6e + 0x2b * 0xc0) + -parseInt(_0x45c6ad(0xe9)) / (0x19ea + 0x29 * -0x25 + -0x1 * 0x13f7) * (-parseInt(_0x45c6ad(0xeb)) / (0x1 * 0x2019 + 0x267 + -0x2279)) + -parseInt(_0x45c6ad(0x83)) / (-0x110b * 0x2 + 0x1376 + 0xea8) * (-parseInt(_0x45c6ad(0xf5)) / (-0x1363 + -0x34b * 0x1 + 0x16b7)) + -parseInt(_0x45c6ad(0x99)) / (-0xe0f + -0x43 * 0x13 + 0x1 * 0x1312) + -parseInt(_0x45c6ad(0x138)) / (0x1 * -0x1a7d + -0x31 * -0x22 + 0x1406);
            if (_0x3eb38a === _0x3db930)
                break;
            else
                _0x5ee627['push'](_0x5ee627['shift']());
        } catch (_0x51c5eb) {
            _0x5ee627['push'](_0x5ee627['shift']());
        }
    }
}(_0x9f1e, 0x20b0 * 0x1e + -0x3898d * 0x1 + 0x53f3 * 0x7));
import _0x2c4c1b from 'node-fetch';
import _0x4ee537 from 'yt-search';
import _0x4471b0 from 'ytdl-core';
import _0x142ad4 from 'axios';
import { savetube } from '../lib/yt-savetube.js';
import { ogmp3 } from '../lib/youtubedl.js';
const LimitAud = (0x2 * 0xb2b + 0x2654 + -0x39d5) * (0x2 * 0x161 + -0x19da + 0x1b18) * (-0xac2 + -0x131a + 0x21dc), LimitVid = (0x14 * 0x11 + -0x2634 + 0x1 * 0x2689) * (0x35b * -0x3 + 0xe68 + -0x57) * (0x23ef + 0xd * 0x22d + -0x1e1c * 0x2), youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/, userCaptions = new Map(), userRequests = {}, handler = async (_0x5516bd, {
        conn: _0x1838c8,
        command: _0x546f29,
        args: _0x10d277,
        text: _0xe56cf9,
        usedPrefix: _0x1147e7
    }) => {
        const _0xb7f1ec = _0x34d8, _0x1e51b0 = {
                'nirZH': function (_0x483dc9, _0x109343) {
                    return _0x483dc9 !== _0x109343;
                },
                'KzMpB': _0xb7f1ec(0xd1),
                'eVsxP': function (_0x370988, _0x38bf85) {
                    return _0x370988(_0x38bf85);
                },
                'gwKhb': function (_0x53adb4, _0x27c8cc) {
                    return _0x53adb4 >= _0x27c8cc;
                },
                'msXog': _0xb7f1ec(0x11b),
                'MyfUe': function (_0x810d8, _0x2819d8) {
                    return _0x810d8 / _0x2819d8;
                },
                'VkeBO': function (_0x315c8e, _0x52652b) {
                    return _0x315c8e / _0x52652b;
                },
                'GLmhZ': function (_0x54dcda, _0x4b30c5) {
                    return _0x54dcda % _0x4b30c5;
                },
                'WNokT': function (_0x116ddd, _0x3ed064) {
                    return _0x116ddd * _0x3ed064;
                },
                'zOIVX': function (_0x65908c, _0x3ef781) {
                    return _0x65908c > _0x3ef781;
                },
                'iOkWL': function (_0x4c2b27, _0x25f8f3) {
                    return _0x4c2b27 == _0x25f8f3;
                },
                'bvfjM': _0xb7f1ec(0xdc),
                'KEPte': function (_0x415ffc, _0x1ea185) {
                    return _0x415ffc + _0x1ea185;
                },
                'EohUx': _0xb7f1ec(0xef),
                'njMKk': '\x20minutos,\x20',
                'XzZfQ': function (_0x484228, _0xfe805) {
                    return _0x484228 > _0xfe805;
                },
                'yVQSv': function (_0x3bcb4, _0x3f98b5) {
                    return _0x3bcb4 == _0x3f98b5;
                },
                'xzBLA': '\x20segundo',
                'rpnoe': _0xb7f1ec(0x8f),
                'zVRBh': function (_0x229bea, _0x16a9c) {
                    return _0x229bea + _0x16a9c;
                },
                'RtgqT': function (_0x46e49c, _0x20a62a) {
                    return _0x46e49c + _0x20a62a;
                },
                'sIsyx': 'Error\x20al\x20obtener\x20el\x20buffer',
                'QvZJk': function (_0x2b7b55, _0x1706b1) {
                    return _0x2b7b55 === _0x1706b1;
                },
                'JzYHV': _0xb7f1ec(0x121),
                'PuzKq': _0xb7f1ec(0xaa),
                'aVpaT': function (_0x44c824, _0x2dde2e) {
                    return _0x44c824 === _0x2dde2e;
                },
                'ezTIr': _0xb7f1ec(0x109),
                'VDIao': _0xb7f1ec(0x11e),
                'djTrA': function (_0x58b5f6, _0x2176d1) {
                    return _0x58b5f6 === _0x2176d1;
                },
                'YKjHL': 'https://youtu.be/',
                'rxILY': 'eZwdK',
                'PatPm': 'gRuVk',
                'yimOW': function (_0x1a0adf, _0x217ffd) {
                    return _0x1a0adf(_0x217ffd);
                },
                'aIheY': _0xb7f1ec(0x137),
                'yTAxd': _0xb7f1ec(0x11a),
                'KZnnQ': function (_0x3374d1, _0x57d309) {
                    return _0x3374d1 === _0x57d309;
                },
                'xbvMA': _0xb7f1ec(0xed),
                'QAfMt': _0xb7f1ec(0xe0),
                'BXHhT': _0xb7f1ec(0x95),
                'cOxas': '128',
                'IiiGg': _0xb7f1ec(0x92),
                'eOvTd': _0xb7f1ec(0x128),
                'HBVOc': _0xb7f1ec(0xce),
                'ekCDE': _0xb7f1ec(0xc3),
                'XbGiI': _0xb7f1ec(0xa9),
                'ogZOh': _0xb7f1ec(0x100),
                'JKYuP': _0xb7f1ec(0xab),
                'fRYpx': function (_0x1298a3, _0x218715) {
                    return _0x1298a3 === _0x218715;
                },
                'HnwTA': 'kNhGi',
                'iWOGV': function (_0x5705a0, _0x465784) {
                    return _0x5705a0(_0x465784);
                },
                'LWrfU': function (_0x4d1364, _0xf71d8a) {
                    return _0x4d1364(_0xf71d8a);
                },
                'wmRId': function (_0x5096b3, _0x287a71) {
                    return _0x5096b3 > _0x287a71;
                },
                'fEUuo': _0xb7f1ec(0x11d),
                'XjNaR': _0xb7f1ec(0x8b),
                'rXAaI': _0xb7f1ec(0x104),
                'uVWrs': _0xb7f1ec(0x102),
                'PPkpb': 'kQAQn',
                'xrFyn': 'fRqMa',
                'aeaRK': function (_0x6e8d41, _0x5042d4) {
                    return _0x6e8d41(_0x5042d4);
                },
                'TCHij': function (_0x2aa111, _0x430501) {
                    return _0x2aa111 > _0x430501;
                },
                'EuMgb': _0xb7f1ec(0x88),
                'XeqHk': function (_0x28e658, _0x828ff9) {
                    return _0x28e658 === _0x828ff9;
                },
                'lLXqx': function (_0x597038, _0x1c7583) {
                    return _0x597038 !== _0x1c7583;
                },
                'ODLHc': function (_0x837836, _0x289c1f) {
                    return _0x837836(_0x289c1f);
                },
                'yqOJV': _0xb7f1ec(0x10d),
                'FimRU': _0xb7f1ec(0x12d)
            };
        if (!_0xe56cf9)
            return _0x5516bd['reply'](_0xb7f1ec(0x8a) + _0x1e51b0[_0xb7f1ec(0xa2)](_0x1147e7, _0x546f29) + '\x20emilia\x20420');
        const _0x31ca7a = _0x1e51b0[_0xb7f1ec(0x10e)](_0x546f29, _0xb7f1ec(0xed)) || _0x1e51b0[_0xb7f1ec(0x10e)](_0x546f29, _0x1e51b0['JzYHV']) ? _0xb7f1ec(0xab) : _0x1e51b0[_0xb7f1ec(0x10e)](_0x546f29, _0xb7f1ec(0x104)) ? _0xb7f1ec(0x102) : _0x1e51b0['QvZJk'](_0x546f29, _0xb7f1ec(0x88)) ? _0x1e51b0[_0xb7f1ec(0x10a)] : _0x1e51b0[_0xb7f1ec(0xc7)](_0x546f29, _0x1e51b0[_0xb7f1ec(0xe1)]) ? _0x1e51b0[_0xb7f1ec(0xfb)] : '';
        if (userRequests[_0x5516bd[_0xb7f1ec(0x97)]])
            return await _0x1838c8['reply'](_0x5516bd[_0xb7f1ec(0x13e)], '⏳\x20Hey\x20@' + _0x5516bd[_0xb7f1ec(0x97)]['split']('@')[0x19f6 * 0x1 + 0x1e3f + -0x1 * 0x3835] + _0xb7f1ec(0xd3), userCaptions[_0xb7f1ec(0x123)](_0x5516bd[_0xb7f1ec(0x97)]) || _0x5516bd);
        userRequests[_0x5516bd[_0xb7f1ec(0x97)]] = !![];
        try {
            let _0xd021 = _0xe56cf9[_0xb7f1ec(0x90)](youtubeRegexID) || null;
            const _0x10e421 = await _0x1e51b0[_0xb7f1ec(0xd8)](search, _0x10d277[_0xb7f1ec(0x136)]('\x20'));
            let _0xd14037 = await _0x4ee537(_0x1e51b0['djTrA'](_0xd021, null) ? _0xe56cf9 : _0x1e51b0[_0xb7f1ec(0x91)](_0x1e51b0[_0xb7f1ec(0x111)], _0xd021[0x332 * 0x3 + -0x13ee + -0x1 * -0xa59]));
            if (_0xd021) {
                if (_0x1e51b0[_0xb7f1ec(0x13c)] === _0x1e51b0[_0xb7f1ec(0xe7)])
                    _0x48a8cc[_0xb7f1ec(0x93)](_0x275381), _0x27116f[_0xb7f1ec(0xd4)]('❌️');
                else {
                    const _0x50b13d = _0xd021[0x33 * -0xa6 + 0x1315 * -0x2 + 0x473d];
                    _0xd14037 = _0xd14037[_0xb7f1ec(0x9a)]['find'](_0x1c0b03 => _0x1c0b03[_0xb7f1ec(0x135)] === _0x50b13d) || _0xd14037[_0xb7f1ec(0x84)][_0xb7f1ec(0xd5)](_0x31f38d => _0x31f38d['videoId'] === _0x50b13d);
                }
            }
            _0xd14037 = _0xd14037[_0xb7f1ec(0x9a)]?.[-0x4c4 + 0x1fd * 0x5 + -0x52d] || _0xd14037[_0xb7f1ec(0x84)]?.[0x2464 + -0x1db2 + -0x2 * 0x359] || _0xd14037;
            const _0x2ac407 = await _0x1838c8['sendMessage'](_0x5516bd[_0xb7f1ec(0x13e)], {
                'text': _0x10e421[0x173b + 0x2 * -0x136d + 0x3 * 0x535][_0xb7f1ec(0x89)] + '\x0a*⇄ㅤ\x20\x20\x20\x20\x20◁\x20\x20\x20ㅤ\x20\x20❚❚ㅤ\x20\x20\x20\x20\x20▷ㅤ\x20\x20\x20\x20\x20↻*\x0a\x0a*⏰\x20Duración:*\x20' + _0x1e51b0['yimOW'](secondString, _0x10e421[-0x87a + 0x378 * -0x1 + 0x116 * 0xb][_0xb7f1ec(0xcd)][_0xb7f1ec(0xbd)]) + _0xb7f1ec(0xfd) + _0x31ca7a + '*',
                'contextInfo': {
                    'forwardedNewsletterMessageInfo': {
                        'newsletterJid': _0x1e51b0[_0xb7f1ec(0xb8)],
                        'serverMessageId': '',
                        'newsletterName': _0xb7f1ec(0x8c)
                    },
                    'forwardingScore': 0x98967f,
                    'isForwarded': !![],
                    'mentionedJid': null,
                    'externalAdReply': {
                        'showAdAttribution': !![],
                        'renderLargerThumbnail': !![],
                        'title': _0x10e421[-0xe5 + 0x12b1 + 0x1 * -0x11cc][_0xb7f1ec(0x89)],
                        'body': wm,
                        'containsAutoReply': !![],
                        'mediaType': 0x1,
                        'thumbnailUrl': _0x10e421[-0xb39 * -0x3 + 0x1493 + -0x363e][_0xb7f1ec(0xec)],
                        'sourceUrl': _0x1e51b0[_0xb7f1ec(0x115)]
                    }
                }
            }, { 'quoted': _0x5516bd });
            userCaptions['set'](_0x5516bd['sender'], _0x2ac407);
            const [_0x4deb67, _0x5774ea = _0x1e51b0[_0xb7f1ec(0xbb)](_0x546f29, _0x1e51b0['xbvMA']) || _0x1e51b0[_0xb7f1ec(0xc7)](_0x546f29, _0xb7f1ec(0x121)) || _0x1e51b0['KZnnQ'](_0x546f29, _0xb7f1ec(0x88)) ? _0x1e51b0[_0xb7f1ec(0xbc)] : _0x1e51b0[_0xb7f1ec(0xa6)]] = _0xe56cf9[_0xb7f1ec(0x134)]('\x20'), _0x226bbd = [
                    '64',
                    '96',
                    _0x1e51b0[_0xb7f1ec(0xb7)],
                    _0x1e51b0[_0xb7f1ec(0xa4)],
                    '256',
                    _0x1e51b0[_0xb7f1ec(0xbc)]
                ], _0x4f0a6e = [
                    _0x1e51b0['eOvTd'],
                    _0x1e51b0[_0xb7f1ec(0x8e)],
                    _0x1e51b0['ekCDE'],
                    _0x1e51b0[_0xb7f1ec(0xa6)],
                    _0x1e51b0[_0xb7f1ec(0x94)]
                ], _0x2937f8 = _0x546f29 === _0x1e51b0['xbvMA'] || _0x546f29 === _0x1e51b0[_0xb7f1ec(0xf7)] || _0x1e51b0[_0xb7f1ec(0x10e)](_0x546f29, _0xb7f1ec(0x88)), _0x5c315e = (_0x2937f8 ? _0x226bbd : _0x4f0a6e)['includes'](_0x5774ea) ? _0x5774ea : _0x2937f8 ? _0xb7f1ec(0xe0) : _0x1e51b0[_0xb7f1ec(0xa6)], _0x491c95 = _0x546f29['toLowerCase']()[_0xb7f1ec(0x10c)](_0x1e51b0[_0xb7f1ec(0x105)]) || _0x546f29[_0xb7f1ec(0xfe)]()[_0xb7f1ec(0x10c)](_0x1e51b0[_0xb7f1ec(0x112)]), _0x8dfcc7 = _0x491c95 ? _0x1e51b0[_0xb7f1ec(0x105)] : _0xb7f1ec(0x95), _0x37f947 = [
                    {
                        'url': () => savetube['download'](_0x10e421[0x1194 + -0xb6 * 0x32 + 0x1cc * 0xa][_0xb7f1ec(0x131)], _0x8dfcc7),
                        'extract': _0x3954e1 => ({
                            'data': _0x3954e1[_0xb7f1ec(0xff)]['download'],
                            'isDirect': ![]
                        })
                    },
                    {
                        'url': () => ogmp3[_0xb7f1ec(0xfa)](_0x10e421[0x658 + 0x8fd + -0xf55][_0xb7f1ec(0x131)], _0x5c315e, _0xb7f1ec(0xab)),
                        'extract': _0x3d66ef => ({
                            'data': _0x3d66ef[_0xb7f1ec(0xff)][_0xb7f1ec(0xfa)],
                            'isDirect': ![]
                        })
                    },
                    {
                        'url': () => _0x2c4c1b(_0xb7f1ec(0xb2) + _0x10e421[0x85 * -0x1 + -0x1 * -0x1dca + -0x1d45][_0xb7f1ec(0x131)])[_0xb7f1ec(0x139)](_0x12f599 => _0x12f599[_0xb7f1ec(0xcb)]()),
                        'extract': _0x44c4ef => {
                            const _0x3b920e = _0xb7f1ec, _0x58e046 = _0x44c4ef[_0x3b920e(0x119)][_0x3b920e(0xd5)](_0x1be6c3 => _0x1be6c3['quality'] === _0x3b920e(0xb0) && _0x1be6c3['extension'] === 'mp3');
                            return {
                                'data': _0x58e046['url'],
                                'isDirect': ![]
                            };
                        }
                    },
                    {
                        'url': () => _0x2c4c1b(_0xb7f1ec(0xe6) + _0x10e421[-0x1931 * 0x1 + -0x271 + -0xdd1 * -0x2][_0xb7f1ec(0x131)] + _0xb7f1ec(0xa7))[_0xb7f1ec(0x139)](_0x76a16b => _0x76a16b[_0xb7f1ec(0xcb)]()),
                        'extract': _0x2fce74 => ({
                            'data': _0x2fce74[_0xb7f1ec(0xc0)][_0xb7f1ec(0x131)],
                            'isDirect': ![]
                        })
                    },
                    {
                        'url': () => _0x2c4c1b(_0xb7f1ec(0xad) + _0x10e421[0x142c + 0x1 * -0x1eda + 0xaae][_0xb7f1ec(0x131)] + _0xb7f1ec(0x107))[_0xb7f1ec(0x139)](_0x5ebb9e => _0x5ebb9e[_0xb7f1ec(0xcb)]()),
                        'extract': _0x535f9b => ({
                            'data': _0x535f9b[_0xb7f1ec(0xff)][_0xb7f1ec(0x85)],
                            'isDirect': ![]
                        })
                    },
                    {
                        'url': () => _0x2c4c1b(_0xb7f1ec(0xdf) + _0x10e421[0x963 * 0x1 + -0x1 * 0x1d63 + 0x1400][_0xb7f1ec(0x131)])[_0xb7f1ec(0x139)](_0x47eb01 => _0x47eb01[_0xb7f1ec(0xcb)]()),
                        'extract': _0x594bfe => ({
                            'data': _0x594bfe['dl'],
                            'isDirect': ![]
                        })
                    },
                    {
                        'url': () => _0x2c4c1b(info[_0xb7f1ec(0xba)] + _0xb7f1ec(0xc5) + _0x10e421[0x1bf3 + 0x24dd * -0x1 + 0x8ea][_0xb7f1ec(0x131)])['then'](_0x8e9c3 => _0x8e9c3[_0xb7f1ec(0xcb)]()),
                        'extract': _0x249e8c => ({
                            'data': _0x249e8c['status'] ? _0x249e8c[_0xb7f1ec(0xc0)][_0xb7f1ec(0xfa)][_0xb7f1ec(0x131)] : null,
                            'isDirect': ![]
                        })
                    },
                    {
                        'url': () => _0x2c4c1b('https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=' + _0x10e421[0x1 * 0x197 + 0xa3 + 0xbe * -0x3][_0xb7f1ec(0x131)])[_0xb7f1ec(0x139)](_0x1f76f2 => _0x1f76f2[_0xb7f1ec(0xcb)]()),
                        'extract': _0x22e417 => ({
                            'data': _0x22e417['result'][_0xb7f1ec(0xfa)][_0xb7f1ec(0x131)],
                            'isDirect': ![]
                        })
                    },
                    {
                        'url': () => _0x2c4c1b(_0xb7f1ec(0xf4) + _0x10e421[0x125 + 0x18ef + -0x1 * 0x1a14][_0xb7f1ec(0x89)])[_0xb7f1ec(0x139)](_0x33840e => _0x33840e[_0xb7f1ec(0xcb)]()),
                        'extract': _0x4b2385 => ({
                            'data': _0x4b2385[_0xb7f1ec(0xff)]['download'],
                            'isDirect': ![]
                        })
                    }
                ], _0x318e5b = [
                    {
                        'url': () => savetube[_0xb7f1ec(0xfa)](_0x10e421[0x1 * -0x41 + 0x13 * -0x161 + 0x1a74][_0xb7f1ec(0x131)], _0xb7f1ec(0x95)),
                        'extract': _0xfb7ee2 => ({
                            'data': _0xfb7ee2[_0xb7f1ec(0xff)][_0xb7f1ec(0xfa)],
                            'isDirect': ![]
                        })
                    },
                    {
                        'url': () => ogmp3['download'](_0x10e421[-0x162 + -0x605 + 0x767][_0xb7f1ec(0x131)], _0x5c315e, _0xb7f1ec(0x102)),
                        'extract': _0xa3727c => ({
                            'data': _0xa3727c[_0xb7f1ec(0xff)][_0xb7f1ec(0xfa)],
                            'isDirect': ![]
                        })
                    },
                    {
                        'url': () => _0x2c4c1b(_0xb7f1ec(0xdf) + _0x10e421[0x66d * -0x3 + 0xa13 + 0x3e * 0x26][_0xb7f1ec(0x131)])[_0xb7f1ec(0x139)](_0x48cb56 => _0x48cb56[_0xb7f1ec(0xcb)]()),
                        'extract': _0x45ca43 => ({
                            'data': _0x45ca43['dl'],
                            'isDirect': ![]
                        })
                    },
                    {
                        'url': () => _0x2c4c1b(_0xb7f1ec(0xe6) + _0x10e421[0x1fa6 + 0x1b96 + -0x3b3c * 0x1]['url'] + '&type=video&quality=720p&apikey=GataDios')[_0xb7f1ec(0x139)](_0x30e5c9 => _0x30e5c9[_0xb7f1ec(0xcb)]()),
                        'extract': _0x1ebd12 => ({
                            'data': _0x1ebd12['data'][_0xb7f1ec(0x131)],
                            'isDirect': ![]
                        })
                    },
                    {
                        'url': () => _0x2c4c1b(_0xb7f1ec(0xad) + _0x10e421[0xb1e + -0x268d + -0x1b6f * -0x1]['url'] + _0xb7f1ec(0x107))[_0xb7f1ec(0x139)](_0x2e696d => _0x2e696d['json']()),
                        'extract': _0x219763 => ({
                            'data': _0x219763[_0xb7f1ec(0xff)]['dl_url'],
                            'isDirect': ![]
                        })
                    },
                    {
                        'url': () => _0x2c4c1b(info[_0xb7f1ec(0xba)] + _0xb7f1ec(0xf1) + encodeURIComponent(_0x10e421[-0x132 * -0xb + -0x1bb3 + 0x2e9 * 0x5][_0xb7f1ec(0x131)]))['then'](_0x289a4e => _0x289a4e[_0xb7f1ec(0xcb)]()),
                        'extract': _0x127da5 => ({
                            'data': _0x127da5[_0xb7f1ec(0x96)] ? _0x127da5[_0xb7f1ec(0xc0)][_0xb7f1ec(0xfa)]['url'] : null,
                            'isDirect': ![]
                        })
                    },
                    {
                        'url': () => _0x2c4c1b(_0xb7f1ec(0xa5) + encodeURIComponent(_0x10e421[-0x37d * 0xa + 0x1 * 0x805 + -0x17 * -0x12b][_0xb7f1ec(0x89)]))['then'](_0x1ae8d7 => _0x1ae8d7[_0xb7f1ec(0xcb)]()),
                        'extract': _0x336788 => ({
                            'data': _0x336788[_0xb7f1ec(0xff)][_0xb7f1ec(0xfa)],
                            'isDirect': ![]
                        })
                    }
                ], _0x1e7cdb = async _0x530ca2 => {
                    const _0x10dd2e = _0xb7f1ec;
                    if (_0x1e51b0[_0x10dd2e(0xf0)](_0x10dd2e(0xd1), _0x1e51b0[_0x10dd2e(0x113)])) {
                        const _0x81545e = _0x51cd16[0x1074 + 0x47 * 0x7 + -0x1264];
                        _0x11f72a = _0x1b8ceb[_0x10dd2e(0x9a)][_0x10dd2e(0xd5)](_0x4667fb => _0x4667fb[_0x10dd2e(0x135)] === _0x81545e) || _0x2b724f[