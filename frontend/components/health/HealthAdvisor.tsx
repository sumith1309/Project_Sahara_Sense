"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Baby, UserCircle, Stethoscope, HardHat, Activity, Heart, CheckCircle, Zap, AlertTriangle, AlertOctagon, Skull, ChevronDown, ChevronRight, Phone, Lightbulb, Shield, Droplets, Home, Wind } from 'lucide-react';

interface HealthAdvisorProps {
  dustLevel: number;
  aqi: number;
  language?: 'en' | 'ar';
}

type UserGroup = 'general' | 'sensitive' | 'children' | 'elderly' | 'respiratory' | 'outdoor_workers' | 'athletes' | 'pregnant';

const recommendations: Record<string, Record<UserGroup, { en: string; ar: string; actions: string[] }>> = {
  LOW: {
    general: {
      en: "Air quality is good. Enjoy outdoor activities freely.",
      ar: "جودة الهواء جيدة. استمتع بالأنشطة الخارجية.",
      actions: ['Outdoor activities safe', 'Windows can be open', 'No precautions needed']
    },
    sensitive: {
      en: "Air quality is acceptable for most people.",
      ar: "جودة الهواء مقبولة للأغلبية.",
      actions: ['Monitor for symptoms', 'Keep medication handy']
    },
    children: {
      en: "Safe for outdoor play and school activities.",
      ar: "آمن للعب في الخارج والأنشطة المدرسية.",
      actions: ['Outdoor play safe', 'Sports activities OK']
    },
    elderly: {
      en: "Safe for normal daily activities.",
      ar: "آمن للأنشطة اليومية العادية.",
      actions: ['Morning walks OK', 'Normal routine safe']
    },
    respiratory: {
      en: "Generally safe. Keep rescue inhaler accessible.",
      ar: "آمن بشكل عام. احتفظ بجهاز الاستنشاق.",
      actions: ['Monitor breathing', 'Keep inhaler ready']
    },
    outdoor_workers: {
      en: "Safe for all outdoor work activities.",
      ar: "آمن لجميع الأعمال الخارجية.",
      actions: ['Normal work schedule', 'Stay hydrated']
    },
    athletes: {
      en: "Ideal conditions for outdoor training.",
      ar: "ظروف مثالية للتدريب الخارجي.",
      actions: ['Full training OK', 'Competitions safe']
    },
    pregnant: {
      en: "Safe for outdoor activities.",
      ar: "آمن للأنشطة الخارجية.",
      actions: ['Light walks OK', 'Normal activities safe']
    }
  },
  MODERATE: {
    general: {
      en: "Limit prolonged outdoor exertion during peak hours.",
      ar: "حد من المجهود الخارجي المطول خلال ساعات الذروة.",
      actions: ['Reduce intense outdoor activity', 'Stay hydrated', 'Watch for symptoms']
    },
    sensitive: {
      en: "Reduce outdoor activities. Consider wearing a mask.",
      ar: "قلل الأنشطة الخارجية. فكر في ارتداء قناع.",
      actions: ['Limit outdoor time', 'Wear mask if needed', 'Use air purifier indoors']
    },
    children: {
      en: "Limit outdoor play time. Keep activities light.",
      ar: "حد من وقت اللعب الخارجي. حافظ على الأنشطة خفيفة.",
      actions: ['Shorter play periods', 'Indoor activities preferred', 'Watch for coughing']
    },
    elderly: {
      en: "Stay indoors during peak afternoon hours.",
      ar: "ابقَ في الداخل خلال ساعات الذروة.",
      actions: ['Avoid 12-4pm outdoors', 'Keep windows closed', 'Use AC if available']
    },
    respiratory: {
      en: "Keep medications ready. Avoid dusty areas.",
      ar: "احتفظ بالأدوية جاهزة. تجنب المناطق المغبرة.",
      actions: ['Pre-medicate if needed', 'Avoid construction areas', 'Monitor peak flow']
    },
    outdoor_workers: {
      en: "Take more frequent breaks. Stay hydrated.",
      ar: "خذ المزيد من فترات الراحة. حافظ على الترطيب.",
      actions: ['15-min breaks hourly', 'Drink water regularly', 'Wear dust mask']
    },
    athletes: {
      en: "Reduce training intensity. Consider indoor alternatives.",
      ar: "قلل من شدة التدريب. فكر في البدائل الداخلية.",
      actions: ['Lower intensity', 'Shorter sessions', 'Indoor gym option']
    },
    pregnant: {
      en: "Limit outdoor exposure. Stay in well-ventilated areas.",
      ar: "حد من التعرض الخارجي. ابقَ في مناطق جيدة التهوية.",
      actions: ['Minimize outdoor time', 'Use air purifier', 'Stay hydrated']
    }
  },
  HIGH: {
    general: {
      en: "Avoid prolonged outdoor activities. Wear mask if outside.",
      ar: "تجنب الأنشطة الخارجية المطولة. ارتدِ قناعًا إذا خرجت.",
      actions: ['Stay indoors when possible', 'N95 mask outdoors', 'Close windows']
    },
    sensitive: {
      en: "Stay indoors. Use air purifier. Avoid all outdoor exertion.",
      ar: "ابقَ في الداخل. استخدم منقي الهواء. تجنب كل مجهود خارجي.",
      actions: ['Do not go outside', 'Run air purifier', 'Seal windows/doors']
    },
    children: {
      en: "Keep children indoors. Cancel outdoor school activities.",
      ar: "أبقِ الأطفال في الداخل. ألغِ الأنشطة المدرسية الخارجية.",
      actions: ['Indoor play only', 'No outdoor PE', 'Watch for symptoms']
    },
    elderly: {
      en: "Stay indoors. Keep windows closed. Monitor health.",
      ar: "ابقَ في الداخل. أغلق النوافذ. راقب صحتك.",
      actions: ['Do not go outside', 'Use air conditioning', 'Check on neighbors']
    },
    respiratory: {
      en: "Stay indoors. Use rescue inhaler if needed. Monitor symptoms.",
      ar: "ابقَ في الداخل. استخدم جهاز الاستنشاق. راقب الأعراض.",
      actions: ['Stay inside', 'Pre-medicate', 'Have emergency plan ready']
    },
    outdoor_workers: {
      en: "Use N95 mask. Take frequent breaks in clean air.",
      ar: "استخدم قناع N95. خذ راحة متكررة في هواء نظيف.",
      actions: ['Mandatory N95 mask', '10-min breaks every 30 min', 'Hydrate constantly']
    },
    athletes: {
      en: "Move all training indoors. No outdoor competitions.",
      ar: "انقل كل التدريبات للداخل. لا مسابقات خارجية.",
      actions: ['Indoor training only', 'Postpone outdoor events', 'Monitor breathing']
    },
    pregnant: {
      en: "Stay indoors. Avoid any outdoor exposure.",
      ar: "ابقَ في الداخل. تجنب أي تعرض خارجي.",
      actions: ['Stay inside', 'Use air purifier', 'Contact doctor if symptoms']
    }
  },
  SEVERE: {
    general: {
      en: "Stay indoors. Close all windows and doors. Use air filtration.",
      ar: "ابقَ في الداخل. أغلق جميع النوافذ والأبواب. استخدم تنقية الهواء.",
      actions: ['Do not leave home', 'Seal all openings', 'Run air purifiers']
    },
    sensitive: {
      en: "Do not go outside under any circumstances. Use air filtration.",
      ar: "لا تخرج تحت أي ظرف. استخدم تنقية الهواء.",
      actions: ['Stay sealed indoors', 'Maximum air filtration', 'Have medications ready']
    },
    children: {
      en: "Schools should cancel all outdoor activities. Keep indoors.",
      ar: "يجب على المدارس إلغاء جميع الأنشطة الخارجية.",
      actions: ['No school outdoor activities', 'Indoor recess only', 'Monitor for symptoms']
    },
    elderly: {
      en: "Stay indoors. Have medications ready. Seek help if symptoms worsen.",
      ar: "ابقَ في الداخل. جهز الأدوية. اطلب المساعدة إذا تفاقمت الأعراض.",
      actions: ['Do not leave home', 'Medications accessible', 'Emergency contacts ready']
    },
    respiratory: {
      en: "CRITICAL: Stay indoors. Pre-medicate. Seek medical help if needed.",
      ar: "حرج: ابقَ في الداخل. تناول الدواء مسبقًا. اطلب المساعدة الطبية.",
      actions: ['Absolute indoor stay', 'Use preventive medication', 'Hospital bag ready']
    },
    outdoor_workers: {
      en: "Stop all outdoor work. Move to indoor areas immediately.",
      ar: "أوقف جميع الأعمال الخارجية. انتقل للداخل فورًا.",
      actions: ['Stop outdoor work', 'Move indoors', 'Report any symptoms']
    },
    athletes: {
      en: "Cancel all training. No physical activity outdoors.",
      ar: "ألغِ جميع التدريبات. لا نشاط بدني في الخارج.",
      actions: ['All training cancelled', 'Rest day recommended', 'Monitor health']
    },
    pregnant: {
      en: "CRITICAL: Stay indoors. Contact healthcare provider.",
      ar: "حرج: ابقَ في الداخل. اتصل بمقدم الرعاية الصحية.",
      actions: ['Absolute indoor stay', 'Contact doctor', 'Monitor fetal movement']
    }
  },
  EXTREME: {
    general: {
      en: "EMERGENCY: Stay indoors. Seal all windows and doors.",
      ar: "طوارئ: ابقَ في الداخل. أغلق جميع النوافذ والأبواب بإحكام.",
      actions: ['Emergency protocols', 'Seal home completely', 'Maximum filtration']
    },
    sensitive: {
      en: "EMERGENCY: Do not leave home. Seek medical attention if symptoms occur.",
      ar: "طوارئ: لا تغادر المنزل. اطلب الرعاية الطبية إذا ظهرت أعراض.",
      actions: ['Do not leave', 'Emergency contacts ready', 'Medications accessible']
    },
    children: {
      en: "EMERGENCY: Schools should close. Keep children sealed indoors.",
      ar: "طوارئ: يجب إغلاق المدارس. أبقِ الأطفال في الداخل.",
      actions: ['School closure recommended', 'No outdoor exposure', 'Monitor closely']
    },
    elderly: {
      en: "EMERGENCY: Stay indoors. Call for help if any symptoms develop.",
      ar: "طوارئ: ابقَ في الداخل. اتصل للمساعدة إذا ظهرت أي أعراض.",
      actions: ['Do not leave home', 'Emergency services on standby', 'Check in with family']
    },
    respiratory: {
      en: "CRITICAL EMERGENCY: Call emergency services if symptoms worsen.",
      ar: "طوارئ حرجة: اتصل بخدمات الطوارئ إذا تفاقمت الأعراض.",
      actions: ['Hospital may be needed', 'Emergency inhaler ready', 'Call 998 if severe']
    },
    outdoor_workers: {
      en: "ALL OUTDOOR WORK MUST STOP IMMEDIATELY.",
      ar: "يجب إيقاف جميع الأعمال الخارجية فورًا.",
      actions: ['Immediate work stoppage', 'Evacuate to indoor areas', 'Report to supervisor']
    },
    athletes: {
      en: "EMERGENCY: All sports activities cancelled.",
      ar: "طوارئ: إلغاء جميع الأنشطة الرياضية.",
      actions: ['All activities cancelled', 'Stay indoors', 'Monitor health closely']
    },
    pregnant: {
      en: "CRITICAL EMERGENCY: Stay indoors. Contact doctor immediately.",
      ar: "طوارئ حرجة: ابقَ في الداخل. اتصل بالطبيب فورًا.",
      actions: ['Absolute indoor stay', 'Doctor on call', 'Hospital bag ready']
    }
  }
};

const groupIcons: Record<UserGroup, React.ComponentType<{ className?: string }>> = {
  general: User,
  sensitive: Users,
  children: Baby,
  elderly: UserCircle,
  respiratory: Stethoscope,
  outdoor_workers: HardHat,
  athletes: Activity,
  pregnant: Heart
};

const groupLabels: Record<UserGroup, { en: string; ar: string }> = {
  general: { en: 'General', ar: 'عام' },
  sensitive: { en: 'Sensitive', ar: 'حساس' },
  children: { en: 'Children', ar: 'أطفال' },
  elderly: { en: 'Elderly', ar: 'كبار السن' },
  respiratory: { en: 'Respiratory', ar: 'تنفسي' },
  outdoor_workers: { en: 'Workers', ar: 'عمال' },
  athletes: { en: 'Athletes', ar: 'رياضيون' },
  pregnant: { en: 'Pregnant', ar: 'حوامل' }
};

export default function HealthAdvisor({ dustLevel, aqi, language = 'en' }: HealthAdvisorProps) {
  const [selectedGroup, setSelectedGroup] = useState<UserGroup>('general');
  const [showActions, setShowActions] = useState(false);

  const getRiskLevel = () => {
    if (dustLevel >= 200) return 'EXTREME';
    if (dustLevel >= 100) return 'SEVERE';
    if (dustLevel >= 50) return 'HIGH';
    if (dustLevel >= 20) return 'MODERATE';
    return 'LOW';
  };

  const riskLevel = getRiskLevel();

  const riskConfig: Record<string, { bg: string; border: string; text: string; gradient: string; icon: React.ComponentType<{ className?: string }>; cardText: string }> = {
    LOW: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', gradient: 'from-emerald-500/20 to-green-500/20', icon: CheckCircle, cardText: 'text-stone-800' },
    MODERATE: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', gradient: 'from-amber-500/20 to-yellow-500/20', icon: Zap, cardText: 'text-stone-800' },
    HIGH: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', gradient: 'from-orange-500/20 to-red-500/20', icon: AlertTriangle, cardText: 'text-stone-800' },
    SEVERE: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', gradient: 'from-red-500/20 to-rose-500/20', icon: AlertOctagon, cardText: 'text-stone-800' },
    EXTREME: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400', gradient: 'from-purple-500/20 to-pink-500/20', icon: Skull, cardText: 'text-stone-800' }
  };

  const config = riskConfig[riskLevel];
  const recommendation = recommendations[riskLevel][selectedGroup];

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-stone-200 rounded-2xl overflow-hidden shadow-lg">
      <div className="p-6 border-b border-stone-200" style={{ background: 'linear-gradient(135deg, #FFE3E3 0%, #E4D8DC 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4A574 0%, #B8935F 100%)' }}>
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-800">{language === 'en' ? 'Health Advisor' : 'المستشار الصحي'}</h3>
              <p className="text-sm text-stone-600">{language === 'en' ? 'Personalized recommendations' : 'توصيات شخصية'}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${config.bg} ${config.border} ${config.text}`}>
            <config.icon className="h-4 w-4" /> {riskLevel}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/70 border border-stone-200">
            <p className="text-sm text-stone-600 mb-1">{language === 'en' ? 'Dust Level' : 'مستوى الغبار'}</p>
            <p className={`text-3xl font-bold ${config.text}`}>{dustLevel.toFixed(0)} <span className="text-sm text-stone-600">μg/m³</span></p>
          </div>
          <div className="p-4 rounded-xl bg-white/70 border border-stone-200">
            <p className="text-sm text-stone-600 mb-1">AQI</p>
            <p className={`text-3xl font-bold ${config.text}`}>{aqi}</p>
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-stone-200">
        <p className="text-sm text-stone-600 mb-3 font-medium">{language === 'en' ? 'Select your group:' : 'اختر مجموعتك:'}</p>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(groupLabels) as UserGroup[]).map((group) => {
            const IconComponent = groupIcons[group];
            return (
              <motion.button key={group} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedGroup(group)}
                className={`p-3 rounded-xl text-center transition-all ${selectedGroup === group ? `bg-gradient-to-br ${config.gradient} border ${config.border}` : 'bg-stone-100/70 border border-stone-200 hover:bg-white'}`}>
                <IconComponent className={`h-6 w-6 mx-auto mb-1 ${selectedGroup === group ? 'text-stone-800' : 'text-stone-600'}`} />
                <span className={`text-xs font-medium block ${selectedGroup === group ? 'text-stone-800' : 'text-stone-700'}`}>{groupLabels[group][language]}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div key={`${riskLevel}-${selectedGroup}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`p-5 rounded-xl border bg-gradient-to-br ${config.gradient} ${config.border} shadow-md`}>
            <div className="flex items-start gap-4">
              {(() => {
                const IconComponent = groupIcons[selectedGroup];
                return <IconComponent className="h-8 w-8 text-stone-800" />;
              })()}
              <div className="flex-1">
                <h4 className={`font-semibold ${config.cardText} mb-2 flex items-center gap-2`}>
                  {groupLabels[selectedGroup][language]}
                  <span className={`text-xs px-2 py-0.5 rounded ${config.bg} ${config.text} font-bold`}>{riskLevel}</span>
                </h4>
                <p className={`${config.cardText} leading-relaxed font-medium`}>{recommendation[language]}</p>
                <button onClick={() => setShowActions(!showActions)} className={`mt-3 text-sm ${config.cardText} opacity-80 hover:opacity-100 flex items-center gap-1 font-medium`}>
                  {showActions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />} {language === 'en' ? 'Action Items' : 'الإجراءات'}
                </button>
                <AnimatePresence>
                  {showActions && (
                    <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 space-y-1">
                      {recommendation.actions.map((action, i) => (
                        <li key={i} className={`flex items-center gap-2 text-sm ${config.cardText} font-medium`}><span className={config.cardText}>•</span>{action}</li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {(riskLevel === 'SEVERE' || riskLevel === 'EXTREME') && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-red-50 border border-red-300 rounded-xl">
            <div className="flex items-center gap-2 text-red-700 font-semibold mb-3">
              <Phone className="h-5 w-5" />
              {language === 'en' ? 'Emergency Contacts' : 'جهات الطوارئ'}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-stone-600">UAE Emergency</p><p className="text-stone-800 font-bold text-lg">999</p></div>
              <div><p className="text-stone-600">Ambulance</p><p className="text-stone-800 font-bold text-lg">998</p></div>
            </div>
          </motion.div>
        )}

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-5 w-5 text-blue-700" />
            <p className="text-blue-700 font-medium">{language === 'en' ? 'Protection Tips' : 'نصائح الحماية'}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-stone-700">
            <div className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-stone-600" /> N95 masks recommended</div>
            <div className="flex items-center gap-1.5"><Home className="h-4 w-4 text-stone-600" /> Use air purifiers</div>
            <div className="flex items-center gap-1.5"><Droplets className="h-4 w-4 text-stone-600" /> Stay hydrated</div>
            <div className="flex items-center gap-1.5"><Wind className="h-4 w-4 text-stone-600" /> Keep windows closed</div>
          </div>
        </div>
      </div>
    </div>
  );
}