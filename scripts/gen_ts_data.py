# -*- coding: utf-8 -*-
"""
把 raw_extract.json 转成 src/data/elderlyLawData.ts
避免人工抄写 34 省 × 14 维度出错。
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "raw_extract.json"
OUT = ROOT / "src" / "data" / "elderlyLawData.ts"

HEADER = '''// 本文件由 scripts/gen_ts_data.py 从 assets/ 法规原文自动抽取生成
// 数据来源：国家法律法规数据库下载的各省老年人权益保障法规原文
// 重新生成： <venv>/Scripts/python.exe scripts/extract_elderly_law.py && <venv>/Scripts/python.exe scripts/gen_ts_data.py
// 注意：请勿手工大改，改维度请改抽取脚本后重新生成

import type { DimensionMeta, ProvinceLawData } from '@/types'

/** 对比维度元数据：驱动卡片渲染、排序、筛选、地图着色 */
export const dimensions: DimensionMeta[] = [
  { key: 'careLeaveDays', label: '独生子女父母护理假', type: 'number', unit: '天/年',
    group: 'core', higherIsBetter: true, icon: 'Sunny',
    extractRule: '检索"独生子女"邻近的护理假/陪护假天数，排除"非独生子女"档' },
  { key: 'careLeavePaid', label: '护理假带薪', type: 'boolean', group: 'core', icon: 'Money',
    extractRule: '邻近句检索"工资照发/带薪/视为出勤"' },
  { key: 'highAgeAllowanceAge', label: '高龄津贴起始年龄', type: 'number', unit: '周岁',
    group: 'core', higherIsBetter: false, icon: 'Present',
    extractRule: '"高龄津贴/高龄补贴"+年龄，取区间起点，排除≥100岁（属百岁补贴）' },
  { key: 'freeTransitAge', label: '免费乘公共交通', type: 'number', unit: '周岁起',
    group: 'core', higherIsBetter: false, icon: 'Van',
    extractRule: '"公共交通/公交/轨道交通"+"免费/优惠"邻近年龄' },
  { key: 'freeParkAge', label: '免费进公园景区', type: 'number', unit: '周岁起',
    group: 'core', higherIsBetter: false, icon: 'Tree',
    extractRule: '"公园/景区/博物馆/公共文化设施"+"免费/免票/优惠"邻近年龄' },
  { key: 'elderlyDefAge', label: '老年人定义年龄', type: 'number', unit: '周岁',
    group: 'core', higherIsBetter: false, icon: 'User',
    extractRule: '"老年人是指/所称老年人"+年龄，未明确者默认60' },
  { key: 'welfareIndex', label: '综合福利指数', type: 'number', unit: '分',
    group: 'more', higherIsBetter: true, icon: 'DataAnalysis',
    extractRule: '护理假天数 + 布尔福利加权(失能补贴+6/长护险+8/意外险+4/适老化+4/法援+2/探望+2) + 年龄倒推(90-高龄/70-公交/65-公园)' },
  { key: 'careSubsidy', label: '失能/养老服务补贴', type: 'boolean', group: 'core', icon: 'Wallet',
    extractRule: '命中"养老服务补贴/护理补贴/照护补贴/失能补贴"' },
  { key: 'ltcInsurance', label: '长期护理保险', type: 'boolean', group: 'core', icon: 'FirstAidKit',
    extractRule: '命中"长期护理保险/长期照护保险"' },
  { key: 'accidentInsurance', label: '老年人意外险', type: 'boolean', group: 'core', icon: 'Umbrella',
    extractRule: '命中"意外伤害保险/意外险"' },
  { key: 'medicalPriorityAge', label: '就医优待年龄', type: 'number', unit: '周岁起',
    group: 'more', higherIsBetter: false, icon: 'Hospital',
    extractRule: '"优先就诊/绿色通道/优先挂号"邻近年龄' },
  { key: 'homeAdaptation', label: '适老化改造', type: 'boolean', group: 'more', icon: 'HomeFilled',
    extractRule: '命中"适老化改造/无障碍改造"' },
  { key: 'centenarianAllowance', label: '百岁老人补贴', type: 'text', group: 'more', icon: 'Medal',
    extractRule: '"百岁/长寿保健补助"邻近金额' },
  { key: 'legalAid', label: '法律援助', type: 'boolean', group: 'more', icon: 'ScaleToOriginal',
    extractRule: '命中"法律援助"' },
  { key: 'filialVisit', label: '赡养探望条款', type: 'boolean', group: 'more', icon: 'House',
    extractRule: '命中"定期探望/常回家看看/与老年人分开居住"' },
]

/** 护理假在本法规中的落地状态 */
export type CareLeaveStatus = 'explicit' | 'timeonly' | 'none'

export const careLeaveStatusText: Record<CareLeaveStatus, string> = {
  explicit: '有明确天数',
  timeonly: '仅规定陪护时间',
  none: '本法规未规定',
}

/**
 * 各省老年人权益保障法规对比数据（34 个省级行政区）
 * 缺失值为 null，卡片渲染为「—」，表示"该法规原文未明确规定"
 */
export const provinces: ProvinceLawData[] = [
'''


def short_name(geo: str) -> str:
    for suf in ("维吾尔自治区", "壮族自治区", "回族自治区", "自治区",
                "特别行政区", "省", "市"):
        if geo.endswith(suf):
            return geo[: -len(suf)]
    return geo


def pick_source(docs: list) -> str:
    """优先取"权益保障条例/实施办法"作为主依据文件。"""
    for d in docs:
        if "权益保障" in d or "实施" in d:
            return d
    return docs[0] if docs else ""


def compute_welfare(v: dict) -> int:
    """
    综合福利指数（0-90+）：把多项福利合并成一个便于地图对比的复合分。
    公式（透明、可调整）：
      基础分 = 护理假天数
      布尔福利 = 失能/养老补贴 +6 / 长护险 +8 / 意外险 +4 / 适老化 +4 / 法援 +2 / 探望 +2
      年龄倒推（起始年龄越小越好）：
        高龄津贴 = max(0, 90 - 起始年龄)   80→10, 70→20, 65→25
        免费公交 = max(0, 70 - 起始年龄)   60→10, 65→5, 70→0
        免费公园 = max(0, 65 - 起始年龄)   60→5, 65→0
    """
    score = 0
    cl = v.get("careLeaveDays")
    if isinstance(cl, (int, float)):
        score += cl
    for key, w in [("careSubsidy", 6), ("ltcInsurance", 8),
                    ("accidentInsurance", 4), ("homeAdaptation", 4),
                    ("legalAid", 2), ("filialVisit", 2)]:
        if v.get(key) is True:
            score += w
    aa = v.get("highAgeAllowanceAge")
    if isinstance(aa, (int, float)):
        score += max(0, 90 - aa)
    ft = v.get("freeTransitAge")
    if isinstance(ft, (int, float)):
        score += max(0, 70 - ft)
    fp = v.get("freeParkAge")
    if isinstance(fp, (int, float)):
        score += max(0, 65 - fp)
    return int(score)


# 这三地不套用内地"默认 60 周岁"的兜底——它们各有自己的老年定义，
# 未知就留空（由 note 说明），绝不能臆造成 60。
NO_DEF_DEFAULT = {"香港特别行政区", "澳门特别行政区", "台湾省"}

# 港澳台三地情况特殊，写清说明，避免把"原文不含"误读成"当地没有该福利"
NOTES = {
    "香港特别行政区": (
        "提供的是 Cap.459《安老院条例》（Residential Care Homes (Elderly Persons) "
        "Ordinance）英文版，24 页纯扫描件，已 OCR 识别（54461 字）。"
        "**该条例规管安老院发牌与运营**（牌照、经营者责任、护理标准、巡查），"
        "属机构式照顾服务体系，已据此填入「失能/养老服务补贴」；"
        "**不含高龄津贴、护理假、交通优惠等现金福利条款**，故这些维度为空，"
        "并非香港没有相关福利（如长者生活津贴、2 元乘车优惠另见其他法例）。"
    ),
    "台湾省": (
        "提供的是《老人福利法》第三章「服务措施」节选（5 页）。"
        "已抽出：机构式照顾服务、住家环境改善、关怀访视等服务项目；"
        "**第 25 条确有「搭乘大众运输工具、进入康乐场所及参观文教设施予以半价优待」**，"
        "但老年定义（第 2 条，65 岁）不在本份原文内，无法据此推导优待起始年龄，"
        "故年龄类维度留空——并非没有该福利。"
    ),
    "澳门特别行政区": (
        "依据《长者权益保障法律制度》（第 12/2018 号法律）：第二条明确"
        "「长者是指年龄为六十五岁或以上的人」；第十三条明定长者在"
        "「文化、康乐及体育设施」与「乘搭集体运输工具」方面依法享有收费优惠或豁免，"
        "条款未重复写年龄，按上述定义推导为 65 岁；另设长者照顾体系"
        "（家庭照顾 + 居家式/社区式/机构式服务）。"
    ),
}


def ts_val(v):
    if v is None:
        return "null"
    if v is True:
        return "true"
    if v is False:
        return "false"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "\\'") + "'"


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    lines = [HEADER]

    for geo, rec in data.items():
        v = rec["values"]
        docs = rec["docs"]
        vals = {
            "careLeaveDays": v.get("careLeaveDays"),
            "careLeavePaid": v.get("careLeavePaid"),
            "careLeaveStatus": v.get("careLeaveStatus", "none"),
            "careLeaveGeneralDays": v.get("careLeaveGeneralDays"),
            "highAgeAllowanceAge": v.get("highAgeAllowanceAge"),
            "freeTransitAge": v.get("freeTransitAge"),
            "freeParkAge": v.get("freeParkAge"),
            "elderlyDefAge": v.get("elderlyDefAge"),
            "medicalPriorityAge": v.get("medicalPriorityAge"),
            "careSubsidy": v.get("careSubsidy"),
            "ltcInsurance": v.get("ltcInsurance"),
            "accidentInsurance": v.get("accidentInsurance"),
            "homeAdaptation": v.get("homeAdaptation"),
            "centenarianAllowance": v.get("centenarianAllowance"),
            "legalAid": v.get("legalAid"),
            "filialVisit": v.get("filialVisit"),
            "welfareIndex": compute_welfare(v),  # 复合：基础分+布尔福利+年龄倒推
        }
        # 内地法规未明确写定义年龄的，沿用国家法 60 周岁；
        # 港澳台各有自己的老年定义（台湾《老人福利法》为 65 岁），不能套用内地 60 岁。
        # 注意必须按名称排除：台湾省在 assets/省/ 目录下，category 也是"省"，
        # 只用 category 判断会把它误当成内地省份填 60 岁。
        if (
            vals["elderlyDefAge"] is None
            and not v.get("_noText")
            and geo not in NO_DEF_DEFAULT
        ):
            vals["elderlyDefAge"] = 60

        items = ",\n".join(f"    {k}: {ts_val(val)}" for k, val in vals.items())
        note_line = (
            f"    note: '{NOTES[geo]}',\n" if geo in NOTES else ""
        )
        lines.append(
            f"  {{\n"
            f"    geoName: '{geo}',\n"
            f"    shortName: '{short_name(geo)}',\n"
            f"    category: '{rec['category']}',\n"
            f"    sourceDoc: '{pick_source(docs)}',\n"
            f"    docFiles: [{', '.join(chr(39) + d + chr(39) for d in docs)}],\n"
            f"{note_line}"
            f"    values: {{\n{items}\n    }},\n"
            f"  }},\n"
        )

    lines.append("]\n\n")
    lines.append(
        "/** geoName → 省份数据，O(1) 查表：地图点击 / 卡片渲染直接走这里 */\n"
        "export const elderlyLawByGeo: Record<string, ProvinceLawData> =\n"
        "  Object.fromEntries(provinces.map((p) => [p.geoName, p]))\n\n"
        "/** 有护理假明确天数的省份，按天数降序（用于排行） */\n"
        "export const careLeaveRanking = provinces\n"
        "  .filter((p) => p.values.careLeaveStatus === 'explicit' && p.values.careLeaveDays)\n"
        "  .sort((a, b) => (b.values.careLeaveDays ?? 0) - (a.values.careLeaveDays ?? 0))\n"
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("".join(lines), encoding="utf-8")
    print(f"已生成：{OUT}")
    print(f"共 {len(data)} 个省级行政区")


if __name__ == "__main__":
    main()
