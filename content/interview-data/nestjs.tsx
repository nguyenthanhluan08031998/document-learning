import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const PROVIDERS = "https://docs.nestjs.com/providers";
const MODULES = "https://docs.nestjs.com/modules";
const LIFECYCLE = "https://docs.nestjs.com/faq/request-lifecycle";
const SCOPES = "https://docs.nestjs.com/fundamentals/injection-scopes";
const CIRCULAR = "https://docs.nestjs.com/fundamentals/circular-dependency";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · nestjs", "interview · nestjs"),
    title: t("Phỏng vấn NestJS", "NestJS interview"),
    lede: t(
      "Bấm vào câu hỏi để xem đáp án, ví dụ và sơ đồ. Nguồn là docs.nestjs.com.",
      "Click a question to see the answer, an example and a diagram. The source is docs.nestjs.com.",
    ),
    items: [
      {
        q: t("Provider là gì? @Injectable làm gì?", "What is a provider? What does @Injectable do?"),
        a: t(
          "Provider là class thường mà Nest có thể inject vào class khác. @Injectable() báo cho IoC (Inversion of Control) container của Nest quản lý class đó; Nest tìm dependency theo kiểu của tham số constructor và truyền instance vào.",
          "A provider is a plain class that Nest can inject into other classes. @Injectable() tells Nest's IoC (Inversion of Control) container to manage the class; Nest finds each dependency by the type of the constructor parameter and passes in the instance.",
        ),
        code: { lang: "ts", src: `@Injectable()
export class CatsService {
  findAll() { return ["Tom"]; }
}

@Controller("cats")
export class CatsController {
  constructor(private readonly cats: CatsService) {}   // ${t("Nest tự truyền instance", "Nest injects the instance")}

  @Get()
  list() { return this.cats.findAll(); }
}` },
        href: PROVIDERS, label: "Providers",
      },
      {
        q: t("Inject interface được không?", "Can you inject an interface?"),
        a: t(
          "Không trực tiếp, vì interface biến mất khi biên dịch. Inject class, hoặc đăng ký một token rồi dùng @Inject(token).",
          "Not directly, because interfaces disappear at compile time. Inject a class, or register a token and use @Inject(token).",
        ),
        code: { lang: "ts", src: `export const MAILER = Symbol("MAILER");

@Module({
  providers: [{ provide: MAILER, useClass: SmtpMailer }],   // ${t("đổi implementation ở đây", "swap the implementation here")}
})
export class MailModule {}

@Injectable()
export class UsersService {
  constructor(@Inject(MAILER) private readonly mailer: Mailer) {}   // Mailer: interface
}` },
        href: PROVIDERS, label: "Providers",
      },
      {
        q: t("Module gồm những gì?", "What does a module contain?"),
        a: t(
          "providers (service do injector tạo, dùng chung trong module), controllers, imports (module khác mà provider được export của nó dùng được), exports (provider chia sẻ ra ngoài). @Global() đưa exports ra toàn app nhưng docs khuyên đừng lạm dụng. Dynamic module cấu hình lúc chạy qua static method như forRoot().",
          "providers (services created by the injector and shared inside the module), controllers, imports (other modules whose exported providers it can use) and exports (providers it shares). @Global() exposes exports app-wide, but the docs advise against overuse. Dynamic modules are configured at runtime through a static method such as forRoot().",
        ),
        code: { lang: "ts", src: `@Module({
  imports: [DatabaseModule],            // ${t("dùng được provider mà DatabaseModule export", "can use what DatabaseModule exports")}
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],               // ${t("chia sẻ cho module khác", "share with other modules")}
})
export class CatsModule {}

// ${t("dynamic module", "dynamic module")}
ConfigModule.forRoot({ isGlobal: true })` },
        href: MODULES, label: "Modules",
      },
      {
        q: t("Thứ tự xử lý một request?", "In what order is a request processed?"),
        a: t(
          "Middleware (global rồi theo module) → guards → interceptors (chiều vào) → pipes → controller handler → interceptors (chiều ra, ngược thứ tự) → exception filters nếu có lỗi chưa bắt. Mỗi loại chạy theo thứ tự global, controller, route.",
          "Middleware (global, then module-bound) → guards → interceptors (inbound) → pipes → controller handler → interceptors (outbound, reverse order) → exception filters if there is an uncaught error. Each kind runs global, then controller, then route.",
        ),
        diagram: <Flow id="nslc" label="Request lifecycle" steps={[
          { title: "Middleware" },
          { title: "Guards", sub: t("cho qua?", "allowed?"), hl: true },
          { title: "Interceptors", sub: t("chiều vào", "inbound") },
          { title: "Pipes", sub: "validate" },
          { title: "Handler", sub: "controller" },
          { title: "Interceptors", sub: t("chiều ra", "outbound") },
          { title: "Filters", sub: t("khi có lỗi", "on error") },
        ]} />,
        href: LIFECYCLE, label: "Request lifecycle",
      },
      {
        q: t("Guard, interceptor, pipe, filter khác nhau?", "Guard vs interceptor vs pipe vs filter?"),
        a: t(
          "Guard quyết định cho request đi tiếp hay không (xác thực, phân quyền). Interceptor bọc handler, chạy trước và sau (log, map response, cache). Pipe biến đổi hoặc kiểm tra tham số đầu vào. Exception filter biến lỗi chưa bắt thành response.",
          "A guard decides whether the request may continue (authentication, authorization). An interceptor wraps the handler, running before and after (logging, response mapping, caching). A pipe transforms or validates input parameters. An exception filter turns uncaught errors into responses.",
        ),
        code: [
          { lang: "ts", src: `@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    return Boolean(req.headers.authorization);     // ${t("false → 403", "false → 403")}
  }
}

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const start = Date.now();
    return next.handle().pipe(tap(() => console.log(Date.now() - start, "ms")));
  }
}` },
          { lang: "ts", src: `@Get(":id")
@UseGuards(AuthGuard)
@UseInterceptors(TimingInterceptor)
find(@Param("id", ParseIntPipe) id: number) {      // ${t("pipe: chuỗi → số, sai thì 400", "pipe: string → number, 400 if invalid")}
  return this.cats.findOne(id);
}

@Catch(HttpException)
export class HttpFilter implements ExceptionFilter {
  catch(e: HttpException, host: ArgumentsHost) { /* ${t("định dạng lại response lỗi", "reshape the error response")} */ }
}` },
        ],
        href: LIFECYCLE, label: "Request lifecycle",
      },
      {
        q: t("Middleware khác guard?", "Middleware vs guard?"),
        a: t(
          "Middleware chạy trước guard và không biết handler nào sẽ xử lý request. Guard chạy sau middleware, trước interceptor và pipe, có ExecutionContext nên chuyên dùng cho phân quyền.",
          "Middleware runs before guards and does not know which handler will process the request. Guards run after middleware and before interceptors and pipes, and receive an ExecutionContext, which makes them the place for authorization.",
        ),
        code: { lang: "ts", src: `// middleware: (req, res, next)
export function logger(req, res, next) {
  console.log(req.method, req.url);
  next();
}

// guard: ${t("biết handler và metadata (ví dụ @Roles)", "knows the handler and its metadata (e.g. @Roles)")}
canActivate(ctx: ExecutionContext) {
  const roles = this.reflector.get(Roles, ctx.getHandler());
  return roles.includes(ctx.switchToHttp().getRequest().user.role);
}` },
        href: LIFECYCLE, label: "Request lifecycle",
      },
      {
        q: t("Các scope của provider?", "What are the provider scopes?"),
        a: t(
          "DEFAULT: một instance dùng chung toàn app (singleton). REQUEST: instance mới cho mỗi request. TRANSIENT: mỗi nơi inject nhận instance riêng. Scope REQUEST làm chậm phản hồi vì phải tạo lại mỗi request, nên chỉ dùng khi thật cần.",
          "DEFAULT: one instance shared across the app (singleton). REQUEST: a new instance per request. TRANSIENT: each consumer that injects it gets its own instance. REQUEST scope slows responses because it is instantiated on every request, so use it only when truly needed.",
        ),
        code: { lang: "ts", src: `@Injectable()                                    // DEFAULT
export class ConfigService {}

@Injectable({ scope: Scope.REQUEST })            // ${t("mới cho mỗi request", "new per request")}
export class RequestContext {}

@Injectable({ scope: Scope.TRANSIENT })          // ${t("mỗi nơi inject một bản", "one per consumer")}
export class Helper {}` },
        href: SCOPES, label: "Injection scopes",
      },
      {
        q: t("Circular dependency xử lý thế nào?", "How do you handle a circular dependency?"),
        a: t(
          "Hai class phụ thuộc lẫn nhau. Giải quyết bằng forwardRef() với @Inject() ở cả hai phía, hoặc lấy một provider lúc chạy bằng ModuleRef. Docs khuyên tránh vòng phụ thuộc ngay từ thiết kế.",
          "Two classes depend on each other. Resolve it with forwardRef() and @Inject() on both sides, or fetch one provider at runtime with ModuleRef. The docs advise avoiding circular dependencies by design.",
        ),
        code: { lang: "ts", src: `@Injectable()
export class CatsService {
  constructor(@Inject(forwardRef(() => CommonService)) private common: CommonService) {}
}

@Injectable()
export class CommonService {
  constructor(@Inject(forwardRef(() => CatsService)) private cats: CatsService) {}
}` },
        href: CIRCULAR, label: "Circular dependency",
      },
    ],
  };
}
