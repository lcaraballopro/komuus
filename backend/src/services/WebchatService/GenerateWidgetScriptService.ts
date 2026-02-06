import AppError from "../../errors/AppError";
import WebchatChannel from "../../models/WebchatChannel";

interface Request {
    id: number;
    tenantId: number;
    baseUrl: string;
}

interface Response {
    embedCode: string;
    scriptUrl: string;
}

const GenerateWidgetScriptService = async ({
    id,
    tenantId,
    baseUrl
}: Request): Promise<Response> => {
    const channel = await WebchatChannel.findOne({
        where: { id, tenantId }
    });

    if (!channel) {
        throw new AppError("ERR_WEBCHAT_CHANNEL_NOT_FOUND", 404);
    }

    const scriptUrl = `${baseUrl}/webchat/widget.js`;

    const embedCode = `<!-- Komu Webchat Widget -->
<script>
  (function(w,d,c,o){
    var s=d.createElement('script');
    s.src='${scriptUrl}';
    s.async=true;
    s.dataset.channelId=c;
    s.dataset.color=o.color||'#6366f1';
    s.dataset.position=o.position||'bottom-right';
    s.dataset.welcomeMessage=o.welcomeMessage||'';
    s.dataset.buttonText=o.buttonText||'Chat';
    s.dataset.apiUrl='${baseUrl}';
    d.head.appendChild(s);
  })(window,document,'${channel.id}',{
    color:'${channel.primaryColor}',
    position:'${channel.position}',
    welcomeMessage:'${(channel.welcomeMessage || "").replace(/'/g, "\\'")}',
    buttonText:'${channel.buttonText || "Chat"}'
  });
</script>`;

    return { embedCode, scriptUrl };
};

export default GenerateWidgetScriptService;
