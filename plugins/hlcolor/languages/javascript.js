//! $Id: plugins/hlcolor/javascript.js 2021.01.19 Articlejs.Plugins $
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//  Project: Articlejs v0.1.0
//  E-Mail:  zhliner@gmail.com
//  Copyright (c) 2021 铁皮工作室  MIT License
//
//////////////////////////////////////////////////////////////////////////////
//
//  JavaScript语言的高亮配置/实现。
//
//
///////////////////////////////////////////////////////////////////////////////
//

import { Hicode, RE, Fx } from "../base.js";


class JavaScript extends Hicode {

    constructor() {
        super([
            {
                begin: RE.REGEX,
                type:  Fx.escapeRegex
            },
        ]);
    }
}


export { JavaScript };
